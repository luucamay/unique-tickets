require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    // Polkadot Asset Hub TestNet
    passetHub: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 420420422, // Polkadot Asset Hub TestNet Chain ID
      gasPrice: 20000000000 // 20 gwei
    },
    polkadotHub: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 420420422, // Polkadot Asset Hub TestNet Chain ID
      gasPrice: 20000000000 // 20 gwei
    },
    // Other testnets
    sepolia: {
      url: "https://1rpc.io/sepolia",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://rpc.goerli.mudit.blog",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5
    },
    // Polygon testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    },
    // Arkiv/Mendoza testnet (if available)
    mendoza: {
      url: process.env.MENDOZA_RPC_URL || "http://localhost:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.MENDOZA_CHAIN_ID) || 1337
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  }
};