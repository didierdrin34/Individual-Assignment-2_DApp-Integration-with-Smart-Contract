"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useWallet } from "../../lib/useWallet";
import { getTokenContract, getReadonlyProvider } from "../../lib/contracts";
import { ethers } from "ethers";


const EXAMPLE_WALLETS = [
  { label: "Deployer (Owner)", address: process.env.NEXT_PUBLIC_WALLET_OWNER || "" },
  { label: "Faculty Rep", address: process.env.NEXT_PUBLIC_WALLET_2 || "" },
  { label: "Student Union", address: process.env.NEXT_PUBLIC_WALLET_3 || "" },
].filter((w) => ethers.isAddress(w.address));

type HolderInfo = { label: string; address: string; balance: string; pct: string };

export default function DashboardPage() {
  const { signer, address, isOwner, alutBalance, connect } = useWallet();
  const [totalSupply, setTotalSupply] = useState("0");
  const [ownerPct, setOwnerPct] = useState("0");
  const [holders, setHolders] = useState<HolderInfo[]>([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    const provider = getReadonlyProvider();
    const token = getTokenContract(provider);
    const supply = await token.totalSupply();
    setTotalSupply(ethers.formatUnits(supply, 18));

    if (address) {
      const pct = await token.ownershipPercentage(address);
      setOwnerPct(pct.toString());
    }

    const infos: HolderInfo[] = await Promise.all(
      EXAMPLE_WALLETS.map(async (w) => {
        const bal = await token.balanceOf(w.address);
        const pct = await token.ownershipPercentage(w.address);
        return {
          label: w.label,
          address: w.address,
          balance: parseFloat(ethers.formatUnits(bal, 18)).toLocaleString(),
          pct: pct.toString(),
        };
      })
    );
    setHolders(infos);
  }, [address]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDistribute(e: React.FormEvent) {
    e.preventDefault();
    if (!signer) { await connect(); return; }
    if (!ethers.isAddress(recipient)) {
      setStatus({ type: "error", msg: "Invalid recipient address." });
      return;
    }
    const amt = parseInt(amount);
    if (!amt || amt <= 0) {
      setStatus({ type: "error", msg: "Amount must be greater than zero." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", msg: "Waiting for wallet approval…" });
    try {
      const token = getTokenContract(signer);
      const tx = await token.distributeShares(recipient, amt);
      setStatus({ type: "info", msg: "Transaction submitted. Waiting for confirmation…" });
      await tx.wait();
      setStatus({ type: "success", msg: `✅ Distributed ${amt.toLocaleString()} ALUT to ${recipient.slice(0, 8)}…` });
      setRecipient("");
      setAmount("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("OwnableUnauthorizedAccount") || msg.includes("onlyOwner")) {
        setStatus({ type: "error", msg: "❌ Only the contract owner can distribute shares." });
      } else {
        setStatus({ type: "error", msg: `❌ ${msg}` });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">ALUT Token Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Overview of ALU Logo Token (ALUT) ownership and share distribution.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs text-slate-500 mb-1">Total Supply</p>
              <p className="text-2xl font-bold text-slate-900">
                {parseFloat(totalSupply).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">ALUT</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs text-slate-500 mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-slate-900">
                {address ? parseFloat(alutBalance).toLocaleString() : "—"}
              </p>
              <p className="text-xs text-slate-400">ALUT</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs text-slate-500 mb-1">Your Ownership</p>
              <p className="text-2xl font-bold text-slate-900">
                {address ? `${ownerPct}%` : "—"}
              </p>
              <p className="text-xs text-slate-400">of total supply</p>
            </div>
          </div>

          {/* Holders table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Example Stakeholders</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Wallet</th>
                  <th className="px-5 py-3 text-right">Balance (ALUT)</th>
                  <th className="px-5 py-3 text-right">Ownership %</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((h) => (
                  <tr key={h.address} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-700">{h.label}</p>
                      <p className="font-mono text-xs text-slate-400">{h.address.slice(0, 10)}…</p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">{h.balance}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {h.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Distribute form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-800 mb-1">Distribute Shares</h2>
            <p className="text-xs text-slate-500 mb-5">
              {isOwner
                ? "You are the contract owner. You can distribute ALUT tokens to any wallet."
                : "Only the contract owner can distribute shares. Connect the owner wallet to use this feature."}
            </p>

            {!address && (
              <button onClick={connect} className="mb-4 text-sm text-blue-600 underline">
                Connect wallet first
              </button>
            )}

            <form onSubmit={handleDistribute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  disabled={!isOwner}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (whole ALUT tokens)</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  disabled={!isOwner}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm ${
                  status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" :
                  status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                  "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isOwner}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? "Processing…" : isOwner ? "Distribute Shares" : "Owner Wallet Required"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
