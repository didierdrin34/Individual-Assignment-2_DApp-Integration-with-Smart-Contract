"use client";

import Link from "next/link";
import { useWallet } from "../../lib/useWallet";

export default function Navbar() {
  const { shortAddress, alutBalance, connect, disconnect, error } = useWallet();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-blue-700 text-lg">ALU dApp</Link>
        <Link href="/register" className="text-sm text-slate-600 hover:text-blue-600 transition">Register</Link>
        <Link href="/verify" className="text-sm text-slate-600 hover:text-blue-600 transition">Verify</Link>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
      </div>

      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-red-500">{error}</span>}
        {shortAddress ? (
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-mono">
              {shortAddress}
            </span>
            <span className="text-xs text-slate-500">
              {parseFloat(alutBalance).toLocaleString()} ALUT
            </span>
            <button
              onClick={disconnect}
              className="text-xs text-slate-400 hover:text-red-500 transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
