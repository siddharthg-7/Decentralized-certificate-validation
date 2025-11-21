const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
let db = null;

/**
 * Initialize SQLite database
 */
async function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Database connection failed:', err);
                reject(err);
            } else {
                console.log('📊 Connected to SQLite database');
                createTables()
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}

/**
 * Create database tables
 */
function createTables() {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txHash TEXT NOT NULL UNIQUE,
        docHash TEXT NOT NULL,
        ipfsCID TEXT NOT NULL,
        issuer TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        blockNumber INTEGER,
        gasUsed TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

        db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Table creation failed:', err);
                reject(err);
            } else {
                console.log('✅ Database tables ready');
                resolve();
            }
        });
    });
}

/**
 * Insert a new transaction record
 * @param {Object} transaction - Transaction details
 * @returns {Promise<number>} Inserted row ID
 */
function insertTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO transactions (txHash, docHash, ipfsCID, issuer, timestamp, status, blockNumber, gasUsed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            transaction.txHash,
            transaction.docHash,
            transaction.ipfsCID,
            transaction.issuer,
            transaction.timestamp,
            transaction.status || 'confirmed',
            transaction.blockNumber,
            transaction.gasUsed
        ];

        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

/**
 * Get transaction by hash
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object|null>} Transaction record
 */
function getTransactionByHash(txHash) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM transactions WHERE txHash = ?';

        db.get(sql, [txHash], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Get transaction by document hash
 * @param {string} docHash - Document hash
 * @returns {Promise<Object|null>} Transaction record
 */
function getTransactionByDocHash(docHash) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM transactions WHERE docHash = ?';

        db.get(sql, [docHash], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Get all transactions with pagination
 * @param {number} limit - Number of records to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of transactions
 */
function getAllTransactions(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM transactions ORDER BY createdAt DESC LIMIT ? OFFSET ?';

        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Get transactions by issuer
 * @param {string} issuer - Issuer address
 * @returns {Promise<Array>} Array of transactions
 */
function getTransactionsByIssuer(issuer) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM transactions WHERE issuer = ? ORDER BY createdAt DESC';

        db.all(sql, [issuer], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Update transaction status
 * @param {string} txHash - Transaction hash
 * @param {string} status - New status
 * @returns {Promise<boolean>} Success status
 */
function updateTransactionStatus(txHash, status) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE transactions SET status = ? WHERE txHash = ?';

        db.run(sql, [status, txHash], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
function getStats() {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        COUNT(*) as totalTransactions,
        COUNT(DISTINCT issuer) as totalIssuers,
        COUNT(DISTINCT docHash) as totalCertificates
      FROM transactions
    `;

        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Close database connection
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initDatabase,
    insertTransaction,
    getTransactionByHash,
    getTransactionByDocHash,
    getAllTransactions,
    getTransactionsByIssuer,
    updateTransactionStatus,
    getStats,
    closeDatabase
};
