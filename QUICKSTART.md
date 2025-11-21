# CertiChain Quick Start Guide

## 🚀 Quick Setup (Windows)

### Option 1: Automated Setup

Run the setup script:
```bash
setup.bat
```

This will install all dependencies for contracts, backend, and frontend.

### Option 2: Manual Setup

```bash
# Install all dependencies
npm run install:all
```

## 📝 Configuration

1. Copy environment file:
```bash
copy .env.example .env
```

2. Edit `.env` and update:
   - `AES_ENCRYPTION_KEY` - Set a secure 32-character key
   - Other settings can remain as default for local development

## 🏃 Running the Application

### Step 1: Start Hardhat Blockchain

Open PowerShell/CMD:
```bash
cd contracts
npx hardhat node
```

**Keep this terminal running!** You'll see test accounts with private keys.

### Step 2: Deploy Smart Contract

Open a new PowerShell/CMD:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

You'll see the contract address. The deployment info is automatically saved.

### Step 3: Start Backend

Open a new PowerShell/CMD:
```bash
cd backend
npm run dev
```

Backend will start on http://localhost:5000

### Step 4: Start Frontend

Open a new PowerShell/CMD:
```bash
cd frontend
npm start
```

Frontend will open automatically at http://localhost:3000

### Step 5: Configure MetaMask

1. **Add Hardhat Network**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account**:
   - Copy a private key from the Hardhat terminal (Step 1)
   - In MetaMask: Click account icon → Import Account → Paste private key
   - You now have test ETH!

## 🎯 Using the Application

### Issue a Certificate

1. Go to http://localhost:3000
2. Click "Connect Wallet" and connect MetaMask
3. Click "Issue Certificate"
4. Upload any file (PDF, image, text, etc.)
5. Fill in the metadata form
6. Click "Issue Certificate"
7. Confirm the transaction in MetaMask
8. Wait for confirmation
9. Copy the document hash for verification

### Verify a Certificate

1. Click "Verify Certificate"
2. Upload the same file you issued
3. Click "Verify Certificate"
4. See the **VALID** result with all details!

### Test Tamper Detection

1. Modify the certificate file (change even 1 character)
2. Try to verify it
3. See the **INVALID** result!

## 🐳 Docker Alternative

If you prefer Docker:

```bash
docker-compose up --build
```

This starts everything:
- Hardhat: http://localhost:8545
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 🧪 Testing

Run smart contract tests:
```bash
cd contracts
npx hardhat test
```

## 📚 Documentation

See [README.md](README.md) for complete documentation.

## ❓ Troubleshooting

### "Cannot find module"
```bash
cd <directory>
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
Kill the process using the port or change the port in configuration.

### "Transaction failed"
Make sure you're connected to the Hardhat Local network in MetaMask.

### "Contract not deployed"
Run the deployment script again:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

## 🎉 You're Ready!

The system is now running. Try issuing and verifying certificates!
