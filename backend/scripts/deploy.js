const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  // Bước 1: Deploy MTKToken
  console.log("Starting deployment of MTKToken...");

  const MTKToken = await ethers.getContractFactory("MTKToken");
  if (!MTKToken) {
    throw new Error("Failed to get contract factory for MTKToken");
  }

  console.log("Deploying MTKToken...");
  const mtkToken = await MTKToken.deploy();
  if (!mtkToken) {
    throw new Error("Failed to deploy MTKToken");
  }

  console.log("Waiting for MTKToken deployment confirmation...");
  const tokenTxReceipt = await mtkToken.deploymentTransaction().wait();
  if (!tokenTxReceipt) {
    throw new Error("MTKToken deployment transaction failed");
  }

  const tokenAddress = await mtkToken.getAddress();
  if (!tokenAddress) {
    throw new Error("MTKToken contract address is undefined");
  }

  console.log("MTKToken deployed to:", tokenAddress);

  // Bước 2: Deploy Wallet với địa chỉ của MTKToken
  console.log("Starting deployment of Wallet...");

  const Wallet = await ethers.getContractFactory("Wallet");
  if (!Wallet) {
    throw new Error("Failed to get contract factory for Wallet");
  }

  console.log("Deploying Wallet with token address:", tokenAddress);
  const wallet = await Wallet.deploy(tokenAddress);
  if (!wallet) {
    throw new Error("Failed to deploy Wallet");
  }

  console.log("Waiting for Wallet deployment confirmation...");
  const walletTxReceipt = await wallet.deploymentTransaction().wait();
  if (!walletTxReceipt) {
    throw new Error("Wallet deployment transaction failed");
  }

  const walletAddress = await wallet.getAddress();
  if (!walletAddress) {
    throw new Error("Wallet contract address is undefined");
  }

  console.log("Wallet deployed to:", walletAddress);
  console.log("Token Address (rewardToken):", await wallet.rewardToken());

  // Bước 3: Chuyển 1000 MTK vào hợp đồng Wallet
  console.log("Transferring 1000 MTK to Wallet...");
  const amount = ethers.parseUnits("1000", 18); // 1000 token (18 chữ số thập phân)
  const tokenContract = MTKToken.attach(tokenAddress);
  const tx = await tokenContract.transfer(walletAddress, amount);
  await tx.wait();

  console.log(`Transferred 1000 MTK to Wallet at ${walletAddress}`);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});