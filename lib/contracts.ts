import { ethers } from "ethers";
import registryABI from "./registryABI.json";
import tokenABI from "./tokenABI.json";

// Update these after running: npx hardhat run scripts/deploy.js --network localhost
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "";
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "";

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
