/**
 * Deploy X402 Payment Contract to Base Network
 * This script deploys the x402 payment contract for micropayments
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting X402 Payment Contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // USDC contract addresses on Base
  const USDC_ADDRESSES = {
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base mainnet
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" // Base Sepolia testnet
  };

  // Determine network
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === 84532n; // Base Sepolia chain ID
  
  const usdcAddress = isTestnet ? USDC_ADDRESSES.baseSepolia : USDC_ADDRESSES.base;
  
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`🔗 USDC Address: ${usdcAddress}`);
  console.log(`🧪 Testnet: ${isTestnet}`);

  // Deploy X402PaymentContract
  console.log("\n📦 Deploying X402PaymentContract...");
  const X402PaymentContract = await ethers.getContractFactory("X402PaymentContract");
  const x402Contract = await X402PaymentContract.deploy(usdcAddress);
  await x402Contract.waitForDeployment();

  const contractAddress = await x402Contract.getAddress();
  console.log(`✅ X402PaymentContract deployed to: ${contractAddress}`);

  // Deploy X402PaymentFactory
  console.log("\n🏭 Deploying X402PaymentFactory...");
  const X402PaymentFactory = await ethers.getContractFactory("X402PaymentFactory");
  const factory = await X402PaymentFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log(`✅ X402PaymentFactory deployed to: ${factoryAddress}`);

  // Verify contract info
  console.log("\n🔍 Verifying contract deployment...");
  const contractInfo = await x402Contract.getContractInfo();
  console.log("Contract Info:", {
    usdcAddress: contractInfo.usdcAddress,
    platformFeeBps: contractInfo.platformFeeBps.toString(),
    owner: await x402Contract.owner()
  });

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  // Check if we can read the USDC token
  try {
    const usdcContract = await ethers.getContractAt("IERC20", usdcAddress);
    const symbol = await usdcContract.symbol();
    const decimals = await usdcContract.decimals();
    console.log(`✅ USDC Token verified: ${symbol} (${decimals} decimals)`);
  } catch (error) {
    console.log("⚠️  Could not verify USDC token:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    isTestnet,
    contracts: {
      X402PaymentContract: {
        address: contractAddress,
        usdcAddress,
        owner: deployer.address
      },
      X402PaymentFactory: {
        address: factoryAddress,
        owner: deployer.address
      }
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorer: isTestnet 
      ? `https://sepolia.basescan.org/address/${contractAddress}`
      : `https://basescan.org/address/${contractAddress}`
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network.name}-${Date.now()}.json`);
  
  // Ensure deployments directory exists
  const deploymentsDir = path.dirname(deploymentFile);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Print summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=" * 50);
  console.log(`Network: ${network.name}`);
  console.log(`X402PaymentContract: ${contractAddress}`);
  console.log(`X402PaymentFactory: ${factoryAddress}`);
  console.log(`USDC Token: ${usdcAddress}`);
  console.log(`Owner: ${deployer.address}`);
  console.log(`Explorer: ${deploymentInfo.explorer}`);
  console.log("=" * 50);

  // Instructions for next steps
  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Verify contracts on BaseScan (optional)");
  console.log("3. Test the contract with some USDC transactions");
  console.log("4. Update your frontend to use the new contract addresses");

  if (isTestnet) {
    console.log("\n🧪 Testnet Instructions:");
    console.log("1. Get testnet USDC from Base Sepolia faucet");
    console.log("2. Test micropayments with small amounts");
    console.log("3. Verify payment proofs work correctly");
  } else {
    console.log("\n⚠️  Mainnet Warning:");
    console.log("1. This is a mainnet deployment - use real USDC");
    console.log("2. Test thoroughly before using in production");
    console.log("3. Consider starting with small amounts");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
