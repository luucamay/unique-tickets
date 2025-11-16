# Polkadot Hub NFT Deployment Guide

## 🌟 Deploy Your Ticket NFT on Polkadot Hub

This guide shows you how to deploy your TicketNFT contract to Polkadot Hub TestNet using both Remix IDE and Hardhat.

## 📋 Prerequisites

Before starting, ensure you have:
- **Talisman Wallet** installed and configured
- **PAS tokens** from the [Polkadot Hub Faucet](https://faucet.polkadot.io/?parachain=1111)
- Basic understanding of smart contracts and NFTs

## 🚀 Method 1: Deploy via Polkadot Remix IDE (Recommended)

### Step 1: Access Polkadot Remix IDE
1. Navigate to [Polkadot Remix IDE](https://remix.polkadot.io/)
2. Connect your Talisman wallet to Polkadot Hub TestNet

### Step 2: Create the Contract File
1. Click **Create new file** under the contracts folder
2. Name it `TicketNFT.sol`
3. Copy the contract code from `/contracts/TicketNFT.sol`

### Step 3: Compile the Contract
1. Select the **Solidity Compiler** plugin from the left panel
2. Ensure compiler version is set to **0.8.22**
3. Click **Compile TicketNFT.sol**
4. Wait for the green checkmark indicating successful compilation

### Step 4: Deploy the Contract
1. Select the **Deploy & Run Transactions** plugin
2. Set **ENVIRONMENT** to "Injected Provider - Talisman"
3. Select your account from the **ACCOUNT** dropdown
4. In the contract deployment section:
   - Find **TICKETNFT** contract
   - Enter your wallet address as the `initialOwner` parameter
   - Click **Deploy**
5. Approve the transaction in Talisman popup
6. Wait for deployment confirmation

### Step 5: Test Your Contract
After deployment, you can test the contract functions:
1. Find your contract under **Deployed/Unpinned Contracts**
2. Test the `safeMint` function:
   - Expand the `safeMint` function
   - Enter a recipient address
   - Click **Transact**
   - Approve in Talisman

## 🛠 Method 2: Deploy via Hardhat (Advanced)

### Step 1: Install Dependencies
```bash
cd contracts
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env
# Edit .env and add your private key:
# PRIVATE_KEY=your_private_key_without_0x_prefix
```

### Step 3: Deploy to Polkadot Hub
```bash
# Deploy to Polkadot Hub TestNet
npm run deploy:polkadot
```

### Step 4: Verify Deployment
The deployment script will output:
- Contract address
- Transaction hash
- Gas usage information
- Environment variable for backend

## 💰 Getting Test Tokens

### PAS Tokens for Gas Fees
1. Visit [Polkadot Hub Faucet](https://faucet.polkadot.io/?parachain=1111)
2. Connect your Talisman wallet
3. Request PAS tokens (note daily limits)
4. Wait for tokens to arrive in your wallet

### Multiple Requests
The faucet has daily limits, so you may need to:
- Make multiple requests over several days
- Use different wallet addresses if needed
- Ensure you have enough PAS for deployment and testing

## 🔧 Contract Features

Your deployed TicketNFT contract includes:

### Standard Functions (OpenZeppelin Compatible)
- `safeMint(address to)` - Simple NFT minting
- `transferFrom()` - Transfer NFTs
- `approve()` - Approve transfers
- `balanceOf()` - Check token balance
- `ownerOf()` - Get token owner

### Custom Ticket Functions
- `mintTicket(address, uint256[], string, uint256)` - Mint tickets with seat info
- `validateTicket(uint256)` - Mark tickets as used/invalid
- `getTicketInfo(uint256)` - Get ticket details
- `getTicketsByOwner(address)` - Get all tickets for an address
- `isSeatMinted(string, uint256)` - Check if seat is already taken

## 🔗 Integration with Backend

After successful deployment:

1. **Copy the contract address** from the deployment output
2. **Update your backend environment**:
   ```bash
   # In backend/.env
   TICKET_NFT_CONTRACT_ADDRESS=0xYourContractAddressHere
   ```
3. **Restart your backend server**:
   ```bash
   cd ../backend
   node index.js
   ```

## 🌐 Network Configuration

### Polkadot Hub TestNet Details
- **Chain ID**: 1111
- **RPC URL**: `https://rpc.polkadot-hub-testnet.polkadot.io`
- **Currency**: PAS tokens
- **Block Time**: ~6 seconds
- **Faucet**: https://faucet.polkadot.io/?parachain=1111

### Add to Talisman
If Polkadot Hub TestNet is not in your Talisman:
1. Open Talisman
2. Go to Settings → Networks
3. Add Custom Network:
   - **Name**: Polkadot Hub TestNet
   - **RPC URL**: `https://rpc.polkadot-hub-testnet.polkadot.io`
   - **Chain ID**: 1111
   - **Currency**: PAS

## 🔍 Verification and Explorer

### Block Explorer
- View your transactions on the Polkadot Hub block explorer
- Search by contract address or transaction hash
- Monitor contract interactions

### Contract Verification
Your contract is automatically verified through Remix IDE deployment.

## ⚡ Quick Commands Reference

```bash
# Install dependencies
cd contracts && npm install

# Compile contract
npm run compile

# Run tests
npm test

# Deploy to Polkadot Hub
npm run deploy:polkadot

# Deploy to local network
npm run deploy:local

# Deploy to other testnets
npm run deploy:testnet  # Sepolia
npm run deploy:mumbai   # Polygon Mumbai
```

## 🎯 Next Steps

After successful deployment:

1. ✅ **Test basic minting** using Remix IDE interface
2. ✅ **Update backend configuration** with contract address  
3. ✅ **Test API integration** - purchase tickets should mint NFTs
4. ✅ **Verify ticket validation** works correctly
5. ✅ **Test customer ticket lookup** by wallet address

## 💡 Tips for Success

- **Gas Estimation**: Deployment typically costs ~2-3M gas units
- **Faucet Strategy**: Request tokens early, faucet has daily limits
- **Testing**: Use Remix IDE for quick testing before API integration
- **Backup**: Save your contract address and transaction hash
- **Security**: Never commit private keys to version control

Your TicketNFT is now deployed on Polkadot Hub and ready for integration! 🎫