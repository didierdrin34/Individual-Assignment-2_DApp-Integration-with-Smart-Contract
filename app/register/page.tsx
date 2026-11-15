"use client";

import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { useWallet } from "../../lib/useWallet";
import { getRegistryContract } from "../../lib/contracts";
import { hashFile } from "../../lib/utils";

export default function RegisterPage() {
  const { signer, address, connect } = useWallet();
  const [preview, setPreview] = useState<string | null>(null);
  const [hash, setHash] = useState("");
  const [assetName, setAssetName] = useState("");
  const [fileType, setFileType] = useState("png");
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStatus({ type: "info", msg: "Computing SHA-256 hash…" });
    const h = await hashFile(file);
    setHash(h);
    setFileType(file.name.split(".").pop() || "png");
    setStatus(null);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!signer) { await connect(); return; }
    if (!hash) { setStatus({ type: "error", msg: "Please select a file first." }); return; }
    if (!assetName.trim()) { setStatus({ type: "error", msg: "Asset name is required." }); return; }

    setLoading(true);
    setStatus({ type: "info", msg: "Waiting for wallet approval…" });
    try {
      const registry = getRegistryContract(signer);
      const tx = await registry.registerAsset(assetName.trim(), fileType, hash);
      setStatus({ type: "info", msg: "Transaction submitted. Waiting for confirmation…" });
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log: { topics: string[]; data: string }) => {
          try { return registry.interface.parseLog(log); } catch { return null; }
        })
        .find((e: { name: string } | null) => e?.name === "AssetRegistered");
      const tokenId = event?.args?.tokenId?.toString() ?? "?";
      setStatus({ type: "success", msg: `✅ Asset registered! Token ID: ${tokenId}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate content hash")) {
        setStatus({ type: "error", msg: "❌ This hash is already registered on the blockchain." });
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
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Register Logo Asset</h1>
          <p className="text-slate-500 text-sm mb-8">
            Upload a logo file to compute its SHA-256 hash and register it as an ERC-721 NFT on the blockchain.
          </p>

          {!address && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              You need to connect your wallet to register an asset.{" "}
              <button onClick={connect} className="underline font-medium">Connect now</button>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* File upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-slate-400">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-sm">Click to select an image file</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Hash display */}
            {hash && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1 font-medium">SHA-256 Hash (bytes32)</p>
                <p className="font-mono text-xs text-slate-700 break-all">{hash}</p>
              </div>
            )}

            {/* Asset name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. ALU Official Logo 2026"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* File type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File Type</label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                placeholder="png"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Status */}
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
              disabled={loading || !hash}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Processing…" : "Register Asset on Blockchain"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
