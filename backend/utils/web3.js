const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider = null;
let contract = null;
let signer = null;

/**
 * Initialize Web3 provider and contract instance
 */
async function initWeb3() {
    try {
        // Connect to Hardhat local network or specified RPC
        const rpcUrl = process.env.HARDHAT_NETWORK === 'localhost'
            ? 'http://127.0.0.1:8545'
            : process.env.RPC_URL;

        provider = new ethers.JsonRpcProvider(rpcUrl);

        // Test connection
        const network = await provider.getNetwork();
        console.log('🌐 Connected to network:', network.name, '(Chain ID:', network.chainId.toString() + ')');

        // Load contract deployment info
        const deploymentPath = path.join(__dirname, '../../contracts/deployments/CertificateRegistry.json');
        const abiPath = path.join(__dirname, '../../contracts/deployments/CertificateRegistry-ABI.json');

        if (!fs.existsSync(deploymentPath) || !fs.existsSync(abiPath)) {
            throw new Error('Contract deployment files not found. Please deploy the contract first.');
        }

        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

        const contractAddress = deployment.contractAddress;
        console.log('📜 Contract address:', contractAddress);

        // Create signer from private key
        if (process.env.PRIVATE_KEY) {
            signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            console.log('🔑 Signer address:', signer.address);

            // Create contract instance with signer
            contract = new ethers.Contract(contractAddress, abi, signer);
        } else {
            // Read-only contract instance
            contract = new ethers.Contract(contractAddress, abi, provider);
            console.warn('⚠️  No private key provided, contract is read-only');
        }

        // Verify contract is deployed
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            throw new Error('No contract deployed at specified address');
        }

        console.log('✅ Web3 initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Web3 initialization failed:', error.message);
        throw error;
    }
}

/**
 * Issue a certificate on the blockchain
 * @param {string} docHash - Document hash (with 0x prefix)
 * @param {string} ipfsCID - IPFS CID or local storage identifier
 * @returns {Promise<Object>} Transaction receipt
 */
async function issueCertificate(docHash, ipfsCID) {
    if (!contract || !signer) {
        throw new Error('Contract not initialized or no signer available');
    }

    try {
        console.log('📝 Issuing certificate...');
        console.log('   Hash:', docHash);
        console.log('   CID:', ipfsCID);

        const tx = await contract.issueCertificate(docHash, ipfsCID);
        console.log('⏳ Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('✅ Certificate issued! Block:', receipt.blockNumber);

        return {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        };
    } catch (error) {
        console.error('Certificate issuance failed:', error);
        throw new Error(`Failed to issue certificate: ${error.message}`);
    }
}

/**
 * Verify a certificate on the blockchain
 * @param {string} docHash - Document hash (with 0x prefix)
 * @returns {Promise<Object>} Certificate details
 */
async function verifyCertificate(docHash) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    try {
        console.log('🔍 Verifying certificate:', docHash);

        const result = await contract.verifyCertificate(docHash);

        return {
            exists: result.exists,
            ipfsCID: result.ipfsCID,
            issuer: result.issuer,
            timestamp: result.timestamp.toString()
        };
    } catch (error) {
        console.error('Certificate verification failed:', error);
        throw new Error(`Failed to verify certificate: ${error.message}`);
    }
}

/**
 * Get full certificate details
 * @param {string} docHash - Document hash (with 0x prefix)
 * @returns {Promise<Object>} Full certificate object
 */
async function getCertificate(docHash) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    try {
        const cert = await contract.getCertificate(docHash);

        return {
            docHash: cert.docHash,
            ipfsCID: cert.ipfsCID,
            issuer: cert.issuer,
            timestamp: cert.timestamp.toString(),
            exists: cert.exists
        };
    } catch (error) {
        console.error('Failed to get certificate:', error);
        throw new Error(`Failed to get certificate: ${error.message}`);
    }
}

/**
 * Check if an address is an authorized issuer
 * @param {string} address - Ethereum address
 * @returns {Promise<boolean>} Authorization status
 */
async function isAuthorizedIssuer(address) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    try {
        return await contract.isAuthorizedIssuer(address);
    } catch (error) {
        console.error('Failed to check issuer authorization:', error);
        return false;
    }
}

/**
 * Get current signer address
 * @returns {string|null} Signer address or null
 */
function getSignerAddress() {
    return signer ? signer.address : null;
}

/**
 * Get provider instance
 * @returns {ethers.Provider|null} Provider instance
 */
function getProvider() {
    return provider;
}

/**
 * Get contract instance
 * @returns {ethers.Contract|null} Contract instance
 */
function getContract() {
    return contract;
}

module.exports = {
    initWeb3,
    issueCertificate,
    verifyCertificate,
    getCertificate,
    isAuthorizedIssuer,
    getSignerAddress,
    getProvider,
    getContract
};
