"use client";

import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { getRegistryContract, getReadonlyProvider } from "../../lib/contracts";
import { hashFile, normaliseHash } from "../../lib/utils";

type VerifyResult = {
  ok: boolean;
  assetName?: string;
  registeredBy?: string;
  timestamp?: string;
  message: string;
};

export default function VerifyPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [hash, setHash] = useState("");
  const [tokenId, setTokenId] = useState("1");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    const h = await hashFile(file);
    setHash(h);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const normHash = normaliseHash(hash);
      const provider = getReadonlyProvider();
      const registry = getRegistryContract(provider);
      const [ok, msg] = await registry.verifyLogoIntegrity(BigInt(tokenId), normHash);

      if (ok) {
        const asset = await registry.getAsset(BigInt(tokenId));
        setResult({
          ok: true,
          message: "Logo Verified: This is the authentic ALU logo.",
          assetName: asset.assetName,
          registeredBy: asset.registeredBy,
          timestamp: new Date(Number(asset.timestamp) * 1000).toLocaleString(),
        });
      } else {
        setResult({ ok: false, message: "Warning: This logo has been modified or does not match the registered asset." });
      }
    } catch (err: unknown) {
      setResult({ ok: false, message: `Error: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex flex-1 justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Logo Authenticity</h1>
          <p className="text-slate-500 text-sm mb-2">
            No wallet required. Upload a logo or paste a hash to check if it matches the registered ALU logo.
          </p>
          <p className="text-xs text-slate-400 mb-8">
            The hash is computed entirely in your browser — your file is never uploaded to any server.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            {/* File upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition"
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-slate-400">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm">Click to upload a logo for verification</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or paste a hash</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Hash input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SHA-256 Hash</label>
              <input
                type="text"
                value={hash}
                onChange={(e) => { setHash(e.target.value); setPreview(null); }}
                placeholder="0x..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Token ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Token ID to verify against</label>
              <input
                type="number"
                min="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !hash}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Verifying…" : "Verify Logo"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-8 p-6 rounded-2xl border-2 ${
              result.ok
                ? "bg-green-50 border-green-400 text-green-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{result.ok ? "✅" : "⚠️"}</span>
                <p className="font-bold text-lg">{result.message}</p>
              </div>
              {result.ok && (
                <div className="text-sm space-y-1 mt-3 border-t border-green-200 pt-3">
                  <p><span className="font-medium">Asset Name:</span> {result.assetName}</p>
                  <p><span className="font-medium">Registered By:</span> <span className="font-mono text-xs">{result.registeredBy}</span></p>
                  <p><span className="font-medium">Registration Date:</span> {result.timestamp}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
