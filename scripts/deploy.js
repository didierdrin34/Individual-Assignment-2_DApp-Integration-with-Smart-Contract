const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hashLogo() {
  const logoPath = path.join(__dirname, "..", "alu-logo.png");
  const fileBuffer = fs.readFileSync(logoPath);
  return "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  const logoHash = hashLogo();
  console.log("ALU logo SHA-256 hash:", logoHash);
  const tx = await registry.registerAsset("ALU Official Logo", "png", logoHash);
  await tx.wait();
  console.log("Logo registered as token ID 1");

  const Token = await hre.ethers.getContractFactory("ALULogoToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ALULogoToken deployed to:", tokenAddress);
  console.log(
    "Deployer ALUT balance:",
    hre.ethers.formatUnits(await token.balanceOf(deployer.address), 18)
  );

  // Write addresses to frontend .env.local for easy configuration
  const envContent = `NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}\nNEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}\nNEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545\n`;
  fs.writeFileSync(path.join(__dirname, "..", ".env.local"), envContent);
  console.log("\n.env.local updated with contract addresses.");
  console.log("ALU Logo SHA-256 Hash:", logoHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
