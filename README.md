# ALU Logo dApp — Assignment 2

A fully working decentralized application (dApp) that connects to the **ALUAssetRegistry** (ERC-721) and **ALULogoToken** (ERC-20) smart contracts from Formative 1. Built with Next.js, TypeScript, ethers.js, and Tailwind CSS.

---

## What This dApp Does

The frontend provides three core features:

| Page | Path | Wallet Required |
|------|------|----------------|
| Register Logo | `/register` | Yes |
| Verify Logo | `/verify` | No |
| Token Dashboard | `/dashboard` | Yes (owner only for distribution) |

**Register** — Upload any image file. The browser computes its SHA-256 hash using the Web Crypto API (no server involved), then calls `registerAsset()` on the ALUAssetRegistry contract to mint an ERC-721 NFT.

**Verify** — Upload a logo file or paste a hash. The app calls `verifyLogoIntegrity()` (a read-only view function) and displays a clear green ✅ or red ⚠️ result with registered metadata. No wallet needed.

**Dashboard** — Shows total ALUT supply (1,000,000), connected wallet balance, ownership percentage, and a table of example stakeholders. The contract owner can distribute shares via `distributeShares()`.

---

## SHA-256 Hash of the Registered ALU Logo

The ALU logo (`alu-logo.png`) was registered as Token ID 1 during deployment. Its SHA-256 hash is printed to the console when you run the deploy script. You can also compute it yourself:

```bash
# On Linux/macOS
sha256sum alu-logo.png

# On Windows PowerShell
Get-FileHash alu-logo.png -Algorithm SHA256
```

The deploy script also writes the hash to the console output and to `.env.local`.

---

## Tech Stack Versions

| Tool | Version |
|------|---------|
| Node.js | 18.x or 20.x |
| Hardhat | ^2.22.0 |
| Next.js | 15.1.0 |
| ethers.js | ^6.17.0 |
| Solidity | 0.8.20 |
| Tailwind CSS | ^3.4.0 |
| TypeScript | ^5 |

---

## Setup Instructions

### 1. Install dependencies

```bash
cd DApp-Integration-with-smart-contract
npm install
```

### 2. Start the local Hardhat blockchain

Open a terminal and keep it running:

```bash
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` and prints 20 test accounts with private keys.

### 3. Deploy the contracts

In a second terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This deploys both contracts, registers the ALU logo as Token ID 1, and writes the contract addresses to `.env.local`.

### 4. Configure MetaMask

1. Open MetaMask → Add Network → Add a network manually
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency Symbol: `ETH`
6. Import one of the Hardhat test accounts using its private key (printed by `npx hardhat node`)

### 5. Run the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Using Each Feature

### Connect Wallet
Click **Connect Wallet** in the top-right navbar. MetaMask will prompt you to approve the connection. Once connected, your shortened address and ALUT balance appear in the navbar.

### Register a Logo
1. Navigate to `/register`
2. Click the upload area and select an image file
3. The SHA-256 hash is computed instantly in your browser
4. Enter an asset name (e.g. `ALU Official Logo 2026`) and confirm the file type
5. Click **Register Asset on Blockchain**
6. Approve the transaction in MetaMask
7. A success message shows the new Token ID

### Verify a Logo
1. Navigate to `/verify` — no wallet needed
2. Upload a logo file **or** paste a SHA-256 hash
3. Enter the Token ID to verify against (default: 1)
4. Click **Verify Logo**
5. A green ✅ confirms authenticity; a red ⚠️ warns of a mismatch

### Token Dashboard
1. Navigate to `/dashboard`
2. View total supply, your balance, and your ownership percentage
3. The stakeholder table shows balances for three example Hardhat accounts
4. If you are connected as the contract owner, the **Distribute Shares** form is enabled
5. Enter a recipient address and whole-token amount, then click **Distribute Shares**

---

## Running Tests

All 13 tests (8 from Formative 1 + 5 new integration tests) are in `test/ALUAssetRegistry.test.js`.

```bash
npx hardhat test
```

Expected output: 13 passing tests across three describe blocks.

---

## Known Issues / Limitations

- The dashboard stakeholder table uses hardcoded Hardhat Account 0–2 addresses. In production these would be fetched from on-chain events.
- The verify page requires knowing the Token ID. A future improvement would be a search-by-hash function.
- MetaMask must be on the Hardhat local network (Chain ID 31337). Switching networks is not automatically handled.
- The `window.ethereum` type is declared manually; a production app would use a library like `wagmi` or `RainbowKit` for more robust wallet management.
