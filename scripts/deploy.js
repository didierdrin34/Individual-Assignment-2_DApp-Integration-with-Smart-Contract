const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy(); // this worked before, so no args
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry:", registryAddress);

  // Match this array to the constructor printed by the check above.
  // Examples: [deployer.address]  or  [deployer.address, registryAddress]
  const TOKEN_ARGS = [deployer.address];

  const Token = await ethers.getContractFactory("ALULogoToken");
  const token = await Token.deploy(...TOKEN_ARGS);
  await token.waitForDeployment();
  console.log("ALULogoToken:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});