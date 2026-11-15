/**
 * Computes the SHA-256 hash of a File using the browser's Web Crypto API.
 * Returns a 0x-prefixed hex string (bytes32 format for Solidity).
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hex;
}

/**
 * Validates and normalises a hex string to 0x-prefixed bytes32.
 */
export function normaliseHash(raw: string): string {
  const stripped = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (!/^[0-9a-fA-F]{64}$/.test(stripped)) {
    throw new Error("Invalid SHA-256 hash: must be 64 hex characters.");
  }
  return "0x" + stripped.toLowerCase();
}

export function shortenAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
