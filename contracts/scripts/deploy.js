const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TicketNFT contract...");

  // Get the contract factory
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");

  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`📋 Contract Details:`);
  console.log(`   Name: Event Tickets`);
  console.log(`   Symbol: TICKET`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Deployer: ${deployer.address}`);

  // Deploy the contract with deployer as initial owner
  console.log("\n⏳ Deploying contract...");
  const ticketNFT = await TicketNFT.deploy(deployer.address);

  // Wait for deployment to complete
  await ticketNFT.waitForDeployment();

  const contractAddress = await ticketNFT.getAddress();
  
  console.log("\n✅ Contract deployed successfully!");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})`);

  // Get deployment transaction details
  const deploymentTx = ticketNFT.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📄 Deployment Transaction: ${deploymentTx.hash}`);
    console.log(`⛽ Gas Used: ${deploymentTx.gasLimit?.toString() || 'N/A'}`);
  }

  // Verify contract functionality
  console.log("\n🔍 Verifying contract functionality...");
  
  try {
    const contractName = await ticketNFT.name();
    const contractSymbol = await ticketNFT.symbol();
    const currentTokenId = await ticketNFT.getCurrentTokenId();
    const totalMinted = await ticketNFT.totalMinted();

    console.log(`   ✅ Name: ${contractName}`);
    console.log(`   ✅ Symbol: ${contractSymbol}`);
    console.log(`   ✅ Current Token ID: ${currentTokenId}`);
    console.log(`   ✅ Total Minted: ${totalMinted}`);
  } catch (error) {
    console.log(`   ⚠️ Verification failed: ${error.message}`);
  }

  // Output environment variable
  console.log("\n📝 Environment Configuration:");
  console.log(`   Add this to your backend .env file:`);
  console.log(`   TICKET_NFT_CONTRACT_ADDRESS=${contractAddress}`);

  // Output for copying to clipboard
  console.log("\n📋 Quick Copy:");
  console.log(contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractName: "Event Tickets",
    contractSymbol: "TICKET",
    deploymentTime: new Date().toISOString(),
    deploymentTxHash: deploymentTx?.hash
  };

  console.log("\n💾 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

// Execute deployment
main()
  .then((info) => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });