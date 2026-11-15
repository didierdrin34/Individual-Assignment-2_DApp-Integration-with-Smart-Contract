import { ethers } from "ethers";
import registryABI from "./registryABI.json";
import tokenABI from "./tokenABI.json";

// Update these after running: npx hardhat run scripts/deploy.js --network localhost
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export function getReadonlyProvider() {
  return new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
  );
}

export function getRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(REGISTRY_ADDRESS, registryABI, signerOrProvider);
}

export function getTokenContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(TOKEN_ADDRESS, tokenABI, signerOrProvider);
}
