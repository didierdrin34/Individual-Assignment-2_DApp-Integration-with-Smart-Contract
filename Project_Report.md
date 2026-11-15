# Project Report — ALU Logo dApp
## Individual Assignment 2: DApp Integration with Smart Contract

**Student:** [Your Name]
**Course:** Blockchain Development
**Date:** November 2026

---

## Abstract

This report documents the development of a decentralized application (dApp) that provides a browser-based frontend for two Ethereum smart contracts — ALUAssetRegistry (ERC-721) and ALULogoToken (ERC-20) — deployed on a local Hardhat blockchain. The dApp enables any user to verify the authenticity of the ALU logo without technical knowledge, and allows the contract owner to manage token-based ownership shares, bridging the gap between raw smart contract logic and real-world usability.

---

## 1. Introduction

In Formative Assessment 1, two Solidity smart contracts were built and deployed on a local Hardhat blockchain. While those contracts correctly implement logo registration and tokenised ownership, they are completely inaccessible to non-technical users — interacting with them requires running terminal commands, knowing contract addresses, and manually encoding function calls.

This assignment fills that gap by building a web-based frontend that connects to both contracts through ethers.js and a MetaMask wallet. The result is a product that any ALU student, faculty member, or administrator can use from a browser without writing a single line of code.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│                                                          │
│  Next.js Frontend (React + TypeScript + Tailwind CSS)   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ /register│  │ /verify  │  │     /dashboard        │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │              │                   │               │
│       └──────────────┴───────────────────┘               │
│                       │                                  │
│              ethers.js (v6)                              │
│                       │                                  │
│         ┌─────────────┴──────────────┐                  │
│         │       MetaMask Wallet       │                  │
│         │  (signs transactions,       │                  │
│         │   holds private key)        │                  │
│         └─────────────┬──────────────┘                  │
└───────────────────────┼─────────────────────────────────┘
                        │ JSON-RPC (http://127.0.0.1:8545)
┌───────────────────────┼─────────────────────────────────┐
│         Hardhat Local Blockchain                         │
│                       │                                  │
│   ┌───────────────────┴──────────────────────┐          │
│   │  ALUAssetRegistry (ERC-721)               │          │
│   │  ALULogoToken (ERC-20)                    │          │
│   └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

The frontend never holds private keys. All transaction signing happens inside MetaMask. Read-only calls (view functions) use a `JsonRpcProvider` directly and require no wallet.

---

## 3. Feature Walkthrough

### 3.1 Home Page (`/`)
The landing page presents three navigation cards linking to Register, Verify, and Dashboard. The navbar on every page shows a **Connect Wallet** button and, once connected, the shortened wallet address and ALUT balance.

### 3.2 Register Logo (`/register`)
A user selects an image file using a drag-and-drop style upload area. The browser immediately computes the SHA-256 hash using `crypto.subtle.digest("SHA-256", buffer)` — no file is ever sent to a server. The hash is displayed in bytes32 format. The user enters an asset name and clicks **Register Asset on Blockchain**, which calls `registerAsset()` on ALUAssetRegistry. MetaMask prompts for approval. On success, the new Token ID is displayed. If the hash already exists, the contract reverts with "duplicate content hash" and the frontend shows a clear error.

### 3.3 Verify Logo (`/verify`)
This page requires no wallet. A user uploads a logo file or pastes a hash. The app calls `verifyLogoIntegrity(tokenId, hash)` — a `view` function that costs no gas. The result is displayed as either a large green ✅ with registered metadata (asset name, registering wallet, date) or a red ⚠️ warning. The language is plain English, with no raw hex strings shown to the user.

### 3.4 Token Dashboard (`/dashboard`)
The dashboard reads `totalSupply()`, `balanceOf()`, and `ownershipPercentage()` from ALULogoToken. Three example Hardhat wallet addresses are shown in a table with their balances and ownership percentages. The **Distribute Shares** form is only enabled when the connected wallet is the contract owner. It calls `distributeShares(recipient, amount)` and refreshes the table after confirmation. Non-owner wallets see the form disabled with the message "Owner Wallet Required".

---

## 4. Wallet and Web3 Integration

### What is an ABI?
An ABI (Application Binary Interface) is a JSON description of a smart contract's public functions, their parameter types, and return types. The frontend needs it to encode function calls into the binary format the EVM understands and to decode the responses. Without the ABI, ethers.js cannot know how to call `registerAsset` or interpret its return value.

### Read-only calls vs. transactions
- **Read-only calls** (`view`/`pure` functions): executed locally by the node, cost no gas, require no wallet signature. Example: `verifyLogoIntegrity()`, `balanceOf()`.
- **Transactions**: change blockchain state, cost gas, and must be signed by the user's private key. Example: `registerAsset()`, `distributeShares()`.

### Why does the user sign transactions?
The user signs transactions with their wallet (MetaMask) because the private key never leaves their device. If the application signed on the user's behalf, it would need to hold the private key, creating a massive security risk. MetaMask acts as a secure key vault — the dApp requests a signature, MetaMask shows the user what they are approving, and only then broadcasts the signed transaction.

### ethers.js role
`ethers.BrowserProvider` wraps the `window.ethereum` object injected by MetaMask. `ethers.Contract` uses the ABI and the signer/provider to create a JavaScript object whose methods map directly to contract functions.

---

## 5. Verification Page — In-Browser Hashing

The Web Crypto API (`crypto.subtle.digest`) is built into every modern browser. The `hashFile()` utility in `lib/utils.ts` reads the file as an `ArrayBuffer` and passes it to `crypto.subtle.digest("SHA-256", buffer)`, returning a 0x-prefixed 64-character hex string.

**Why hash in the browser, not on a server?**
- Privacy: the file never leaves the user's device.
- Trust: a server could lie about the hash. In-browser hashing means the user can verify the computation themselves.
- Decentralisation: no server infrastructure is needed; the dApp can be hosted as a static site.

**What happens when a duplicate hash is registered?**
The `_hashRegistered` mapping in ALUAssetRegistry stores every registered hash. When `registerAsset()` is called, the first line checks `require(!_hashRegistered[contentHash], "Asset already registered: duplicate content hash")`. If the hash exists, the EVM reverts the transaction, no gas is consumed beyond the failed call, and the frontend catches the revert reason and displays it as a user-friendly error.

---

## 6. Token Dashboard — distributeShares Protection

### How `onlyOwner` works
The `distributeShares()` function has the `onlyOwner` modifier from OpenZeppelin's `Ownable` contract. When called, the modifier checks `require(msg.sender == owner(), ...)`. If a non-owner wallet calls it, the EVM reverts with `OwnableUnauthorizedAccount`. The frontend catches this revert and displays "Only the contract owner can distribute shares."

### Real-world example
The ALU Communications team could receive 50,000 ALUT tokens representing their stewardship of the logo. Holding ALUT tokens would give them a verifiable, on-chain record of their ownership stake. In a future version with governance, token holders could vote on logo usage policy proportional to their holdings.

### What would need to change for voting?
The ALULogoToken contract would need to implement ERC-20 Votes (OpenZeppelin's `ERC20Votes` extension), which adds `delegate()` and `getVotes()` functions. A separate `Governor` contract would then allow token holders to create and vote on proposals, with voting power proportional to their delegated token balance at a specific block.

---

## 7. Test Results

All 13 tests pass. Run with:

```bash
npx hardhat test
```

```
ALU Logo Project
  ALUAssetRegistry (ERC-721)
    ✔ 1. registers the ALU logo and returns a token ID
    ✔ 2. rejects registering the same hash twice
    ✔ 3. verifyLogoIntegrity returns true for the correct hash
    ✔ 4. verifyLogoIntegrity returns false for an incorrect hash
    ✔ 5. getAsset returns the correct name and file type
  ALULogoToken (ERC-20)
    ✔ 6. mints the full 1,000,000 ALUT to the logo owner
    ✔ 7. distributeShares transfers tokens to a recipient
    ✔ 8. ownershipPercentage returns the correct percentage
  Frontend Integration Tests
    ✔ 9. frontend reads total ALUT supply and it equals 1,000,000
    ✔ 10. SHA-256 hash of alu-logo.png is a valid bytes32 hex string
    ✔ 11. verifyLogoIntegrity returns success result for the correct ALU logo hash
    ✔ 12. verifyLogoIntegrity returns failure result for an incorrect hash
    ✔ 13. distributeShares correctly updates the recipient balance after transfer

  13 passing (Xs)
```

[Screenshot of passing tests to be inserted here]

---

## 8. Conclusion

This assignment demonstrated how a smart contract backend connects to a browser frontend through ethers.js and a Web3 wallet. The key insight is the separation of concerns: the smart contract enforces rules immutably on-chain, while the frontend makes those rules accessible to non-technical users.

**What I learned:**
- How ABIs bridge Solidity types and JavaScript
- The difference between view calls (free, no wallet) and state-changing transactions (gas, wallet signature)
- How the Web Crypto API enables trustless in-browser file hashing
- How `onlyOwner` reverts propagate from the EVM back to the frontend

**What I would add with more time:**
- WalletConnect support for mobile wallets
- An event-indexed search so users can look up any registered asset by hash without knowing the Token ID
- IPFS storage for the actual logo file, with the IPFS CID stored alongside the hash in the contract
- A governance module using ERC-20 Votes so ALUT holders can vote on logo usage decisions

---

## 9. GitHub Repository

[Insert your public GitHub repository link here]

---

## 10. Video Demonstration

[Insert your screen recording link here — see `DEMO_SCRIPT.md` for the full script]
