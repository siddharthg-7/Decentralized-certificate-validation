# 🔐 CertiChain - Decentralized Certificate Validation System

A complete Web 3.0 blockchain-based certificate issuance and verification system built with Ethereum, IPFS, React, and Node.js.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Smart Contract](#smart-contract)
- [API Documentation](#api-documentation)
- [Frontend Usage](#frontend-usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

CertiChain is a decentralized application (dApp) that enables institutions to issue tamper-proof certificates on the Ethereum blockchain and allows anyone to verify their authenticity instantly.

### How It Works

1. **Certificate Issuance**
   - Authorized institutions upload certificates with metadata
   - System generates SHA-256 hash of the document
   - Metadata is encrypted with AES-256
   - Encrypted metadata stored on IPFS
   - Document hash and IPFS CID recorded on blockchain

2. **Certificate Verification**
   - Anyone uploads a certificate file
   - System computes SHA-256 hash
   - Hash compared with blockchain records
   - If match found → Certificate is VALID
   - If no match or different hash → Certificate is INVALID

## ✨ Features

- ✅ **Tamper-Proof**: Certificates stored as immutable blockchain records
- 🔐 **Encrypted Metadata**: AES-256 encryption for sensitive information
- 📦 **Decentralized Storage**: IPFS integration with local fallback
- 🎨 **Modern UI**: Dark-themed React interface with Tailwind CSS
- 🔌 **MetaMask Integration**: Seamless Web3 wallet connection
- ⚡ **Instant Verification**: Real-time certificate validation
- 🔍 **Audit Trail**: Complete transaction history on blockchain
- 🐳 **Docker Support**: Containerized deployment
- 🧪 **Comprehensive Tests**: Smart contract and API testing
- 📊 **CI/CD Pipeline**: Automated testing with GitHub Actions

## 🏗️ Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Node.js Backend│◄────►│  Ethereum Node   │
│   (Port 5000)   │      │  (Port 8545)     │
└────────┬────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│   IPFS Storage  │
│  (Local/Remote) │
└─────────────────┘
```

### Data Flow

**Issuance:**
```
Certificate File → SHA-256 Hash → Blockchain
Metadata → AES-256 Encrypt → IPFS → CID → Blockchain
```

**Verification:**
```
Certificate File → SHA-256 Hash → Query Blockchain → Match? → Valid/Invalid
```

## 🛠️ Technology Stack

### Blockchain
- **Ethereum**: Decentralized ledger
- **Solidity**: Smart contract language (v0.8.19)
- **Hardhat**: Development environment
- **Ethers.js**: Web3 library (v6.9.0)

### Backend
- **Node.js**: Runtime environment (v18+)
- **Express**: Web framework
- **SQLite**: Transaction logging
- **IPFS**: Decentralized storage
- **Crypto**: SHA-256 & AES-256 encryption

### Frontend
- **React**: UI framework (v18)
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Dropzone**: File uploads

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **GitHub Actions**: CI/CD pipeline

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MetaMask** browser extension - [Install](https://metamask.io/)
- **Git** - [Download](https://git-scm.com/)
- **Docker** (optional) - [Download](https://www.docker.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "certification validation system-web3.0"
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the convenience script:

```bash
npm run install:all
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Change this to a secure 32-character key
AES_ENCRYPTION_KEY=your-secure-32-character-key-here

# Optional: Configure IPFS
USE_IPFS=false
IPFS_HOST=localhost
IPFS_PORT=5001
```

## 🏃 Running Locally

### Option 1: Manual Setup (Recommended for Development)

#### Step 1: Start Hardhat Blockchain

Open a terminal and run:

```bash
cd contracts
npx hardhat node
```

This starts a local Ethereum blockchain on `http://127.0.0.1:8545`

Keep this terminal running.

#### Step 2: Deploy Smart Contract

Open a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy the `CertificateRegistry` contract
- Save the contract address to `deployments/CertificateRegistry.json`
- Save the ABI to `deployments/CertificateRegistry-ABI.json`

**Important**: Copy the contract address from the output.

#### Step 3: Start Backend Server

Open a new terminal:

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:5000`

#### Step 4: Start Frontend

Open a new terminal:

```bash
cd frontend
npm start
```

Frontend will start on `http://localhost:3000`

#### Step 5: Configure MetaMask

1. Open MetaMask
2. Add a new network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

3. Import a test account:
   - Copy a private key from the Hardhat node terminal
   - In MetaMask: Import Account → Private Key
   - Paste the private key

You now have test ETH to interact with the dApp!

### Option 2: Docker Compose

```bash
docker-compose up --build
```

This starts all services:
- Hardhat node: `http://localhost:8545`
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 📜 Smart Contract

### CertificateRegistry.sol

Located at: `contracts/contracts/CertificateRegistry.sol`

#### Key Functions

**Owner Functions:**
```solidity
function addAuthorizedIssuer(address _issuer) external onlyOwner
function removeAuthorizedIssuer(address _issuer) external onlyOwner
```

**Issuer Functions:**
```solidity
function issueCertificate(bytes32 _docHash, string memory _ipfsCID) 
    external onlyAuthorizedIssuer
```

**Public Functions:**
```solidity
function verifyCertificate(bytes32 _docHash) 
    external view returns (bool exists, string memory ipfsCID, address issuer, uint256 timestamp)

function getCertificate(bytes32 _docHash) 
    external view returns (Certificate memory)

function isAuthorizedIssuer(address _issuer) 
    external view returns (bool)
```

#### Events

```solidity
event CertificateIssued(bytes32 indexed docHash, string ipfsCID, address indexed issuer, uint256 timestamp)
event IssuerAdded(address indexed issuer, uint256 timestamp)
event IssuerRemoved(address indexed issuer, uint256 timestamp)
```

### Running Tests

```bash
cd contracts
npx hardhat test
```

Expected output:
```
  CertificateRegistry
    Deployment
      ✓ Should set the deployer as owner
      ✓ Should authorize deployer as issuer
    Issuer Management
      ✓ Should allow owner to add authorized issuer
      ...
  
  21 passing (2s)
```

### Test Coverage

```bash
cd contracts
npx hardhat coverage
```

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### POST /api/issue

Issue a new certificate on the blockchain.

**Request:**
```http
POST /api/issue
Content-Type: multipart/form-data

certificate: <file>
studentName: "John Doe"
courseName: "Computer Science"
institution: "MIT"
issueDate: "2024-01-15"
grade: "A+"
additionalInfo: "Honors degree"
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "docHash": "0xabc123...",
    "ipfsCID": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "transactionHash": "0xdef456...",
    "blockNumber": 42,
    "issuer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

### POST /api/verify

Verify a certificate against the blockchain.

**Request:**
```http
POST /api/verify
Content-Type: multipart/form-data

certificate: <file>
```

**Response (Valid):**
```json
{
  "valid": true,
  "message": "Certificate is valid",
  "certificate": {
    "docHash": "0xabc123...",
    "issuer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "timestamp": "1705334400",
    "ipfsCID": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "metadata": {
      "studentName": "John Doe",
      "courseName": "Computer Science",
      "institution": "MIT",
      "grade": "A+"
    },
    "issuedDate": "2024-01-15T12:00:00.000Z"
  }
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Certificate not found on blockchain",
  "docHash": "0xabc123..."
}
```

### GET /api/cert/:hash

Get certificate details by document hash.

**Request:**
```http
GET /api/cert/0xabc123...
```

**Response:**
```json
{
  "exists": true,
  "certificate": {
    "docHash": "0xabc123...",
    "issuer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "timestamp": "1705334400",
    "ipfsCID": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "metadata": { ... }
  }
}
```

### GET /api/transactions

Get all transactions with pagination.

**Request:**
```http
GET /api/transactions?limit=50&offset=0
```

### GET /api/stats

Get system statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTransactions": 42,
    "totalIssuers": 3,
    "totalCertificates": 42,
    "signerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "isAuthorizedIssuer": true,
    "web3Ready": true,
    "ipfsReady": false
  }
}
```

## 🎨 Frontend Usage

### Home Page (`/`)

- Overview of the system
- Feature highlights
- How it works section
- Navigation to Issue/Verify pages

### Issue Certificate (`/issue`)

1. Connect your MetaMask wallet
2. Upload a certificate file (PDF, image, etc.)
3. Fill in metadata:
   - Student Name (required)
   - Course Name (required)
   - Institution (required)
   - Issue Date (optional)
   - Grade (optional)
   - Additional Info (optional)
4. Click "Issue Certificate"
5. Confirm the transaction in MetaMask
6. Wait for blockchain confirmation
7. View transaction details and document hash

### Verify Certificate (`/verify`)

1. Upload a certificate file
2. Click "Verify Certificate"
3. View results:
   - **Valid**: See certificate details, metadata, issuer, timestamp
   - **Invalid**: See error message and possible reasons

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

### Backend Tests

```bash
cd backend
npm test
```

### Run All Tests

```bash
npm test
```

## 🚢 Deployment

### Deploy to Sepolia Testnet

1. Get Sepolia ETH from a faucet:
   - [Alchemy Faucet](https://sepoliafaucet.com/)
   - [Infura Faucet](https://www.infura.io/faucet/sepolia)

2. Update `.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

3. Deploy:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

4. Update backend and frontend with new contract address

5. Configure MetaMask for Sepolia network

### Production Deployment

For production deployment, consider:

1. **Backend**: Deploy to cloud services (AWS, Heroku, DigitalOcean)
2. **Frontend**: Deploy to Vercel, Netlify, or AWS S3
3. **IPFS**: Use Pinata or Infura IPFS service
4. **Database**: Upgrade to PostgreSQL or MySQL
5. **Security**: Use environment secrets, enable HTTPS, implement rate limiting

## 🔧 Troubleshooting

### MetaMask Connection Issues

**Problem**: "Please install MetaMask"
- **Solution**: Install MetaMask browser extension

**Problem**: "Wrong Network"
- **Solution**: Switch to Hardhat Local (Chain ID 31337) in MetaMask

**Problem**: "Insufficient funds"
- **Solution**: Import a Hardhat test account with ETH

### Backend Issues

**Problem**: "Contract deployment files not found"
- **Solution**: Deploy the smart contract first:
  ```bash
  cd contracts
  npx hardhat run scripts/deploy.js --network localhost
  ```

**Problem**: "Web3 not initialized"
- **Solution**: Ensure Hardhat node is running on port 8545

**Problem**: "IPFS upload failed"
- **Solution**: System automatically falls back to local storage. Check `USE_IPFS` in `.env`

### Frontend Issues

**Problem**: "Failed to fetch"
- **Solution**: Ensure backend is running on port 5000

**Problem**: Build errors
- **Solution**: Delete `node_modules` and reinstall:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

### Docker Issues

**Problem**: Port already in use
- **Solution**: Stop other services using ports 3000, 5000, or 8545

**Problem**: Container won't start
- **Solution**: Check logs:
  ```bash
  docker-compose logs <service-name>
  ```

## 🔒 Security

### Implemented Security Measures

1. **SHA-256 Hashing**: Cryptographically secure document hashing
2. **AES-256 Encryption**: Military-grade metadata encryption
3. **Access Control**: Only authorized issuers can issue certificates
4. **Blockchain Immutability**: Records cannot be altered or deleted
5. **Input Validation**: All inputs sanitized and validated
6. **Environment Variables**: Sensitive data stored securely

### Best Practices

- Never commit `.env` files
- Use strong encryption keys (32+ characters)
- Regularly update dependencies
- Implement rate limiting in production
- Use HTTPS in production
- Audit smart contracts before mainnet deployment

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for excellent development tools
- Ethereum community for blockchain infrastructure
- IPFS for decentralized storage

## 📞 Support

For support, email support@certichain.example or open an issue on GitHub.

---

**Built with ❤️ using Ethereum, React, and Web3 technologies**
