import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          ALU Logo Registry
        </h1>
        <p className="text-slate-500 max-w-xl mb-10 text-lg">
          A decentralized application for registering and verifying the authenticity
          of the African Leadership University logo on the Ethereum blockchain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <Link
            href="/register"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition"
          >
            <span className="text-3xl">📝</span>
            <span className="font-semibold text-slate-800">Register Logo</span>
            <span className="text-sm text-slate-500 text-center">
              Upload a logo file, generate its SHA-256 hash, and register it as an NFT.
            </span>
          </Link>

          <Link
            href="/verify"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-200 hover:border-green-400 hover:shadow-md transition"
          >
            <span className="text-3xl">🔍</span>
            <span className="font-semibold text-slate-800">Verify Logo</span>
            <span className="text-sm text-slate-500 text-center">
              Check whether any logo file matches the authentic registered ALU logo.
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition"
          >
            <span className="text-3xl">📊</span>
            <span className="font-semibold text-slate-800">Token Dashboard</span>
            <span className="text-sm text-slate-500 text-center">
              View ALUT token ownership and distribute shares to stakeholders.
            </span>
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-400">
          Powered by Hardhat · ethers.js · Next.js · Solidity
        </p>
      </main>
    </div>
  );
}
