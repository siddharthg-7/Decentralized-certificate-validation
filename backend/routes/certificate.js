const express = require('express');
const multer = require('multer');
const { hashDocumentForBlockchain, encryptMetadata, decryptMetadata } = require('../utils/crypto');
const { uploadToIPFS, retrieveFromIPFS, initIPFS } = require('../utils/ipfs');
const { initWeb3, issueCertificate, verifyCertificate, getCertificate, getSignerAddress, isAuthorizedIssuer } = require('../utils/web3');
const { insertTransaction, getAllTransactions, getTransactionByDocHash, getStats } = require('../db/database');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Initialize Web3 and IPFS on module load
let web3Ready = false;
let ipfsReady = false;

(async () => {
    try {
        await initWeb3();
        web3Ready = true;
    } catch (error) {
        console.error('Web3 initialization failed:', error.message);
    }

    try {
        ipfsReady = await initIPFS();
    } catch (error) {
        console.error('IPFS initialization failed:', error.message);
    }
})();

/**
 * POST /api/issue
 * Issue a new certificate
 */
router.post('/issue', upload.single('certificate'), async (req, res) => {
    try {
        if (!web3Ready) {
            return res.status(503).json({ error: 'Web3 not initialized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No certificate file provided' });
        }

        // Extract metadata from request
        const metadata = {
            studentName: req.body.studentName,
            courseName: req.body.courseName,
            institution: req.body.institution,
            issueDate: req.body.issueDate,
            grade: req.body.grade,
            additionalInfo: req.body.additionalInfo
        };

        // Validate metadata
        if (!metadata.studentName || !metadata.courseName || !metadata.institution) {
            return res.status(400).json({ error: 'Missing required metadata fields' });
        }

        // Hash the certificate document
        const docHash = hashDocumentForBlockchain(req.file.buffer);
        console.log('📄 Document hash:', docHash);

        // Encrypt metadata
        const encryptionKey = process.env.AES_ENCRYPTION_KEY || 'default-key-change-this-in-production';
        const encryptedData = encryptMetadata(metadata, encryptionKey);

        // Upload encrypted metadata to IPFS
        const ipfsCID = await uploadToIPFS({
            encrypted: encryptedData.encrypted,
            iv: encryptedData.iv,
            algorithm: encryptedData.algorithm
        });

        console.log('🔐 Encrypted metadata uploaded:', ipfsCID);

        // Issue certificate on blockchain
        const txReceipt = await issueCertificate(docHash, ipfsCID);

        // Store transaction in database
        const issuerAddress = getSignerAddress();
        await insertTransaction({
            txHash: txReceipt.transactionHash,
            docHash: docHash,
            ipfsCID: ipfsCID,
            issuer: issuerAddress,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'confirmed',
            blockNumber: txReceipt.blockNumber,
            gasUsed: txReceipt.gasUsed
        });

        res.json({
            success: true,
            message: 'Certificate issued successfully',
            data: {
                docHash: docHash,
                ipfsCID: ipfsCID,
                transactionHash: txReceipt.transactionHash,
                blockNumber: txReceipt.blockNumber,
                issuer: issuerAddress
            }
        });

    } catch (error) {
        console.error('Certificate issuance error:', error);
        res.status(500).json({
            error: 'Failed to issue certificate',
            details: error.message
        });
    }
});

/**
 * POST /api/verify
 * Verify a certificate
 */
router.post('/verify', upload.single('certificate'), async (req, res) => {
    try {
        if (!web3Ready) {
            return res.status(503).json({ error: 'Web3 not initialized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No certificate file provided' });
        }

        // Hash the uploaded certificate
        const docHash = hashDocumentForBlockchain(req.file.buffer);
        console.log('🔍 Verifying hash:', docHash);

        // Verify on blockchain
        const certData = await verifyCertificate(docHash);

        if (!certData.exists) {
            return res.json({
                valid: false,
                message: 'Certificate not found on blockchain',
                docHash: docHash
            });
        }

        // Retrieve and decrypt metadata
        let metadata = null;
        try {
            const encryptedData = await retrieveFromIPFS(certData.ipfsCID);
            const encryptionKey = process.env.AES_ENCRYPTION_KEY || 'default-key-change-this-in-production';
            metadata = decryptMetadata(encryptedData.encrypted, encryptedData.iv, encryptionKey);
        } catch (error) {
            console.warn('Failed to retrieve metadata:', error.message);
        }

        res.json({
            valid: true,
            message: 'Certificate is valid',
            certificate: {
                docHash: docHash,
                issuer: certData.issuer,
                timestamp: certData.timestamp,
                ipfsCID: certData.ipfsCID,
                metadata: metadata,
                issuedDate: new Date(parseInt(certData.timestamp) * 1000).toISOString()
            }
        });

    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({
            error: 'Failed to verify certificate',
            details: error.message
        });
    }
});

/**
 * GET /api/cert/:hash
 * Get certificate details by hash
 */
router.get('/cert/:hash', async (req, res) => {
    try {
        if (!web3Ready) {
            return res.status(503).json({ error: 'Web3 not initialized' });
        }

        const docHash = req.params.hash;

        // Ensure hash has 0x prefix
        const formattedHash = docHash.startsWith('0x') ? docHash : '0x' + docHash;

        // Get certificate from blockchain
        const certData = await getCertificate(formattedHash);

        if (!certData.exists) {
            return res.status(404).json({
                error: 'Certificate not found',
                docHash: formattedHash
            });
        }

        // Try to get metadata
        let metadata = null;
        try {
            const encryptedData = await retrieveFromIPFS(certData.ipfsCID);
            const encryptionKey = process.env.AES_ENCRYPTION_KEY || 'default-key-change-this-in-production';
            metadata = decryptMetadata(encryptedData.encrypted, encryptedData.iv, encryptionKey);
        } catch (error) {
            console.warn('Failed to retrieve metadata:', error.message);
        }

        res.json({
            exists: true,
            certificate: {
                docHash: certData.docHash,
                issuer: certData.issuer,
                timestamp: certData.timestamp,
                ipfsCID: certData.ipfsCID,
                metadata: metadata,
                issuedDate: new Date(parseInt(certData.timestamp) * 1000).toISOString()
            }
        });

    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({
            error: 'Failed to get certificate',
            details: error.message
        });
    }
});

/**
 * GET /api/transactions
 * Get all transactions
 */
router.get('/transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const transactions = await getAllTransactions(limit, offset);

        res.json({
            success: true,
            count: transactions.length,
            transactions: transactions
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            error: 'Failed to get transactions',
            details: error.message
        });
    }
});

/**
 * GET /api/stats
 * Get system statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getStats();
        const signerAddress = getSignerAddress();
        const isAuthorized = signerAddress ? await isAuthorizedIssuer(signerAddress) : false;

        res.json({
            success: true,
            stats: {
                ...stats,
                signerAddress: signerAddress,
                isAuthorizedIssuer: isAuthorized,
                web3Ready: web3Ready,
                ipfsReady: ipfsReady
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            details: error.message
        });
    }
});

module.exports = router;
