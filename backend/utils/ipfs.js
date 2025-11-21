const fs = require('fs').promises;
const path = require('path');

// IPFS configuration
const USE_IPFS = process.env.USE_IPFS === 'true';
const IPFS_STORAGE_PATH = process.env.IPFS_STORAGE_PATH || path.join(__dirname, '../ipfs-storage');

let ipfsClient = null;

// Initialize IPFS client if enabled
async function initIPFS() {
    if (USE_IPFS) {
        try {
            const { create } = await import('ipfs-http-client');
            ipfsClient = create({
                host: process.env.IPFS_HOST || 'localhost',
                port: process.env.IPFS_PORT || 5001,
                protocol: process.env.IPFS_PROTOCOL || 'http'
            });
            console.log('✅ IPFS client initialized');
            return true;
        } catch (error) {
            console.warn('⚠️  IPFS initialization failed, using local storage fallback:', error.message);
            return false;
        }
    } else {
        console.log('📁 Using local filesystem storage (IPFS disabled)');
        return false;
    }
}

/**
 * Upload data to IPFS or local storage
 * @param {Object} data - Data to store
 * @returns {Promise<string>} CID or local file identifier
 */
async function uploadToIPFS(data) {
    const jsonData = JSON.stringify(data, null, 2);

    if (USE_IPFS && ipfsClient) {
        try {
            const result = await ipfsClient.add(jsonData);
            console.log('📤 Uploaded to IPFS:', result.path);
            return result.path;
        } catch (error) {
            console.error('IPFS upload failed, falling back to local storage:', error.message);
        }
    }

    // Fallback to local storage
    return await saveToLocalStorage(data);
}

/**
 * Retrieve data from IPFS or local storage
 * @param {string} cid - CID or local file identifier
 * @returns {Promise<Object>} Retrieved data
 */
async function retrieveFromIPFS(cid) {
    if (USE_IPFS && ipfsClient && !cid.startsWith('local-')) {
        try {
            const chunks = [];
            for await (const chunk of ipfsClient.cat(cid)) {
                chunks.push(chunk);
            }
            const data = Buffer.concat(chunks).toString('utf8');
            console.log('📥 Retrieved from IPFS:', cid);
            return JSON.parse(data);
        } catch (error) {
            console.error('IPFS retrieval failed:', error.message);
            throw new Error('Failed to retrieve data from IPFS');
        }
    }

    // Retrieve from local storage
    return await retrieveFromLocalStorage(cid);
}

/**
 * Save data to local filesystem
 * @param {Object} data - Data to save
 * @returns {Promise<string>} Local file identifier
 */
async function saveToLocalStorage(data) {
    try {
        // Ensure storage directory exists
        await fs.mkdir(IPFS_STORAGE_PATH, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `local-${timestamp}-${random}.json`;
        const filepath = path.join(IPFS_STORAGE_PATH, filename);

        // Save file
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        console.log('💾 Saved to local storage:', filename);

        return filename;
    } catch (error) {
        console.error('Local storage save failed:', error);
        throw new Error('Failed to save data to local storage');
    }
}

/**
 * Retrieve data from local filesystem
 * @param {string} filename - Local file identifier
 * @returns {Promise<Object>} Retrieved data
 */
async function retrieveFromLocalStorage(filename) {
    try {
        const filepath = path.join(IPFS_STORAGE_PATH, filename);
        const data = await fs.readFile(filepath, 'utf8');
        console.log('📂 Retrieved from local storage:', filename);
        return JSON.parse(data);
    } catch (error) {
        console.error('Local storage retrieval failed:', error);
        throw new Error('Failed to retrieve data from local storage');
    }
}

/**
 * Check if IPFS is available
 * @returns {boolean} IPFS availability status
 */
function isIPFSAvailable() {
    return USE_IPFS && ipfsClient !== null;
}

module.exports = {
    initIPFS,
    uploadToIPFS,
    retrieveFromIPFS,
    isIPFSAvailable
};
