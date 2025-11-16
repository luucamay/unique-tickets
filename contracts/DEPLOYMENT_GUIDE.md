# NFT Contract Deployment Guide

## 🚀 Quick Start Deployment

### Step 1: Install Dependencies
```bash
cd contracts
npm install
```

### Step 2: Set Up Environment
```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your private key
nano .env
```

### Step 3: Choose Your Deployment Method

#### Option A: Local Development (Recommended for Testing)
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy to local network
npm run deploy
```

#### Option B: Deploy to Testnet (Sepolia)
```bash
# Make sure you have testnet ETH in your wallet
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

#### Option C: Deploy to Polygon Mumbai (Cheaper)
```bash
# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

### Step 4: Update Backend Configuration
After deployment, copy the contract address and update your backend:
```bash
# In /backend/.env file
TICKET_NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

---

## 📋 Detailed Instructions

### Prerequisites
- Node.js installed
- A wallet with some test ETH (for testnet deployment)
- Private key of your deploying wallet

### 1. Environment Setup

Create a `.env` file in the `/contracts` directory:
```bash
# Your deploying wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# For testnet deployment
SEPOLIA_RPC_URL=https://rpc.sepolia.org
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Optional: for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 2. Get Test ETH

#### For Sepolia (Ethereum Testnet):
- [Sepolia Faucet 1](https://sepoliafaucet.com/)
- [Sepolia Faucet 2](https://faucet.sepolia.dev/)

#### For Mumbai (Polygon Testnet):
- [Mumbai Faucet](https://faucet.polygon.technology/)
- [Alchemy Mumbai Faucet](https://mumbaifaucet.com/)

### 3. Deployment Commands

```bash
# Install dependencies
cd contracts
npm install

# Compile contracts
npm run compile

# Run tests (optional but recommended)
npx hardhat test

# Deploy to local network (for development)
npx hardhat node  # In one terminal
npm run deploy    # In another terminal

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

### 4. Verification (Optional)
After deployment to a testnet, you can verify your contract:
```bash
# Verify on Etherscan (Sepolia)
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Event Tickets" "TICKET"

# Verify on PolygonScan (Mumbai)
npx hardhat verify --network mumbai CONTRACT_ADDRESS "Event Tickets" "TICKET"
```

### 5. Update Backend
After successful deployment, copy the contract address and update your backend `.env`:
```bash
# In your backend/.env file
TICKET_NFT_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Then restart your backend server:
```bash
cd ../backend
node index.js
```

---

## 🛠 Troubleshooting

### Common Issues:

1. **"insufficient funds for gas * price + value"**
   - You need test ETH in your wallet for gas fees
   - Get test ETH from the faucets listed above

2. **"nonce too high"**
   - Reset your MetaMask account or wait a few minutes

3. **"PRIVATE_KEY not found"**
   - Make sure your `.env` file has the correct private key
   - Don't include the `0x` prefix

4. **Contract deployment fails**
   - Check your internet connection
   - Verify the RPC URL is correct
   - Ensure you have enough gas

### Getting Private Key:
1. Open MetaMask
2. Click account menu (3 dots)
3. Account Details → Export Private Key
4. Copy the private key (without 0x)

---

## 🔍 Testing Deployment

After deployment, test the contract:
```bash
# Run the test suite
npx hardhat test

# Test specific functionality
npx hardhat console --network localhost
# Then in console:
const TicketNFT = await ethers.getContractFactory("TicketNFT");
const contract = await TicketNFT.attach("YOUR_CONTRACT_ADDRESS");
await contract.name(); // Should return "Event Tickets"
```

---

## 🌐 Network Options

### Local Development
- **Network**: Hardhat local
- **Chain ID**: 1337
- **Cost**: Free
- **Speed**: Instant

### Sepolia Testnet
- **Network**: Ethereum Sepolia
- **Chain ID**: 11155111
- **Cost**: Free test ETH
- **Speed**: ~12 seconds per block

### Mumbai Testnet
- **Network**: Polygon Mumbai
- **Chain ID**: 80001
- **Cost**: Free test MATIC
- **Speed**: ~2 seconds per block

### Production Options
For mainnet deployment, consider:
- **Ethereum Mainnet** (expensive but most secure)
- **Polygon Mainnet** (cheaper, fast)
- **Arbitrum/Optimism** (L2 solutions)

---

## 📝 Next Steps After Deployment

1. ✅ Update `TICKET_NFT_CONTRACT_ADDRESS` in backend `.env`
2. ✅ Restart your backend server
3. ✅ Test the NFT minting via API
4. ✅ Verify contract on block explorer
5. ✅ Update frontend to show NFT information

The contract is now deployed and ready for your ticket management system! 🎫