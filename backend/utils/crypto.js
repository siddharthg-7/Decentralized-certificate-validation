const crypto = require('crypto');

/**
 * Generate SHA-256 hash of a file buffer
 * @param {Buffer} fileBuffer - File content as buffer
 * @returns {string} Hexadecimal hash string
 */
function hashDocument(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Generate SHA-256 hash with 0x prefix for blockchain
 * @param {Buffer} fileBuffer - File content as buffer
 * @returns {string} Hash with 0x prefix
 */
function hashDocumentForBlockchain(fileBuffer) {
    return '0x' + hashDocument(fileBuffer);
}

/**
 * Encrypt data using AES-256-CBC
 * @param {Object} data - Data to encrypt
 * @param {string} key - Encryption key (32 characters)
 * @returns {Object} Encrypted data with IV
 */
function encryptMetadata(data, key) {
    // Ensure key is 32 bytes
    const encryptionKey = crypto.createHash('sha256').update(key).digest();

    // Generate random IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

    // Encrypt data
    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        algorithm: 'aes-256-cbc'
    };
}

/**
 * Decrypt AES-256-CBC encrypted data
 * @param {string} encryptedData - Encrypted data in hex
 * @param {string} ivHex - Initialization vector in hex
 * @param {string} key - Decryption key
 * @returns {Object} Decrypted data
 */
function decryptMetadata(encryptedData, ivHex, key) {
    // Ensure key is 32 bytes
    const encryptionKey = crypto.createHash('sha256').update(key).digest();

    // Convert IV from hex
    const iv = Buffer.from(ivHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

    // Decrypt data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

/**
 * Generate a random encryption key
 * @returns {string} Random 32-character key
 */
function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    hashDocument,
    hashDocumentForBlockchain,
    encryptMetadata,
    decryptMetadata,
    generateEncryptionKey
};
