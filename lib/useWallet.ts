"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getTokenContract } from "./contracts";
import { shortenAddress } from "./utils";

// Extend Window to include ethereum injected by MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  alutBalance: string;
  isOwner: boolean;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [alutBalance, setAlutBalance] = useState("0");
  const [isOwner, setIsOwner] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAccountData = useCallback(async (provider: ethers.BrowserProvider) => {
    const s = await provider.getSigner();
    const addr = await s.getAddress();
    setSigner(s);
    setAddress(addr);

    const token = getTokenContract(s);
    const raw = await token.balanceOf(addr);
    setAlutBalance(ethers.formatUnits(raw, 18));

    const ownerAddr: string = await token.owner();
    setIsOwner(ownerAddr.toLowerCase() === addr.toLowerCase());
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No Web3 wallet detected. Please install MetaMask.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      await provider.send("eth_requestAccounts", []);
      await loadAccountData(provider);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    }
  }, [loadAccountData]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setAlutBalance("0");
    setIsOwner(false);
  }, []);

  // Auto-reconnect if already authorised
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
    provider.send("eth_accounts", []).then((accounts) => {
      if ((accounts as string[]).length > 0) loadAccountData(provider);
    });

    const handleAccountsChanged = (accounts: unknown) => {
      if ((accounts as string[]).length === 0) disconnect();
      else loadAccountData(provider);
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
  }, [loadAccountData, disconnect]);

  return {
    address,
    shortAddress: address ? shortenAddress(address) : null,
    alutBalance,
    isOwner,
    signer,
    connect,
    disconnect,
    error,
  };
}
