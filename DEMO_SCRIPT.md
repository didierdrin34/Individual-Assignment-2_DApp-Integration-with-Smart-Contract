# Demo Video Script — ALU dApp
## Estimated Duration: 4–6 minutes

---

### SETUP (before recording)

- Terminal 1: `npx hardhat node` — running, showing accounts
- Terminal 2: `npx hardhat run scripts/deploy.js --network localhost` — already run, addresses visible
- Browser: MetaMask installed, connected to Hardhat Local (Chain ID 31337), Account 0 imported
- Browser tab: `http://localhost:3000` open
- Have `alu-logo.png` and a modified/fake logo ready on the desktop

---

### SCENE 1 — Introduction (0:00–0:30)

**[Screen: home page at localhost:3000]**

> "Hi, I'm [Name]. This is my ALU dApp — a decentralized application built with Next.js and ethers.js that connects to two Ethereum smart contracts I wrote in Formative 1: ALUAssetRegistry, an ERC-721 contract for registering the ALU logo, and ALULogoToken, an ERC-20 contract for ownership shares.
>
> The dApp has three features: Register, Verify, and Dashboard. Let me walk through each one."

---

### SCENE 2 — Wallet Connection (0:30–1:00)

**[Screen: home page, navbar showing Connect Wallet button]**

> "First, I'll connect my MetaMask wallet. I click Connect Wallet in the top right."

**[Action: click Connect Wallet → MetaMask popup appears → click Connect]**

> "MetaMask asks me to approve the connection. I click Connect. Now you can see my shortened wallet address here — that's Account 0 from Hardhat — and my ALUT balance of 1,000,000 tokens, because this is the deployer account that received the full supply."

---

### SCENE 3 — Register Page (1:00–2:15)

**[Action: click Register in navbar]**

> "Now let's register a logo. I'll click the upload area and select the ALU logo file."

**[Action: click upload area → select alu-logo.png]**

> "The browser immediately computes the SHA-256 hash — you can see it appear here in bytes32 format. This is done entirely in the browser using the Web Crypto API. The file is never sent to any server."

**[Screen: hash displayed below the image preview]**

> "I'll enter the asset name — 'ALU Official Logo' — and the file type is already set to PNG. Now I click Register Asset on Blockchain."

**[Action: type asset name → click Register Asset on Blockchain]**

> "MetaMask pops up showing the transaction details — the contract address, the estimated gas fee. I click Confirm."

**[Action: click Confirm in MetaMask]**

> "The transaction is submitted. A few seconds later — confirmed. Token ID 1 has been minted. This logo is now permanently registered on the blockchain."

---

### SCENE 4 — Duplicate Rejection (2:15–2:45)

**[Action: click Register Asset on Blockchain again with same file]**

> "What happens if I try to register the same logo twice? I'll click Register again with the same file."

**[Action: confirm in MetaMask → wait for revert]**

> "The transaction reverts. The smart contract's duplicate check fires and the frontend shows: 'This hash is already registered on the blockchain.' The contract enforces uniqueness at the EVM level — there's no way around it."

---

### SCENE 5 — Verify Page (2:45–3:45)

**[Action: click Verify in navbar]**

> "Now the Verify page. Notice — there's no wallet connected requirement here. Anyone can use this page."

**[Action: upload alu-logo.png → set Token ID to 1 → click Verify Logo]**

> "I upload the real ALU logo. The hash is computed in the browser, then the app calls verifyLogoIntegrity on the contract — a read-only view function that costs zero gas. And here's the result:"

**[Screen: green ✅ with 'Logo Verified: This is the authentic ALU logo.' and metadata]**

> "Green checkmark. Authentic. It shows the asset name, the wallet that registered it, and the registration date."

**[Action: upload a different/modified image → click Verify Logo]**

> "Now I'll upload a modified version of the logo — maybe someone changed the colours or added a watermark."

**[Screen: red ⚠️ with 'Warning: This logo has been modified.']**

> "Red warning. The hashes don't match. This is how ALU can protect its brand — anyone who receives a logo can verify it in seconds."

---

### SCENE 6 — Token Dashboard (3:45–5:00)

**[Action: click Dashboard in navbar]**

> "Finally, the Token Dashboard. This shows the total ALUT supply — 1,000,000 — my connected wallet's balance, and my ownership percentage."

**[Screen: stats cards showing 1,000,000 total supply, 1,000,000 balance, 100%]**

> "The stakeholder table shows three example Hardhat accounts. Right now they all have zero tokens because I haven't distributed any yet."

**[Action: scroll to Distribute Shares form]**

> "I'm connected as the contract owner, so the Distribute Shares form is enabled. I'll send 100,000 ALUT to Account 1 — that could represent the Faculty Senate receiving a 10% ownership stake."

**[Action: paste Account 1 address → type 100000 → click Distribute Shares]**

> "MetaMask prompts me to confirm. I approve."

**[Action: confirm in MetaMask → wait for confirmation]**

> "Transaction confirmed. The table updates — Account 1 now shows 100,000 ALUT and 10% ownership. My balance dropped to 900,000."

**[Action: disconnect → connect with Account 1 → show dashboard]**

> "If I switch to Account 1 in MetaMask, my balance in the navbar updates to 100,000 ALUT. The Distribute Shares form is now disabled — only the owner can use it."

---

### SCENE 7 — Tests (5:00–5:30)

**[Screen: terminal running `npx hardhat test`]**

> "Finally, all 13 tests pass — 8 from Formative 1 covering the smart contracts, and 5 new integration tests that simulate what the frontend does: reading total supply, validating the hash format, verifying correct and incorrect hashes, and confirming that distributeShares updates balances correctly."

**[Screen: terminal showing 13 passing]**

---

### SCENE 8 — Closing (5:30–6:00)

**[Screen: home page]**

> "That's the full ALU dApp. Smart contracts on the backend, Next.js on the frontend, ethers.js connecting them, and MetaMask handling all transaction signing. The verify page works for anyone without a wallet, and the entire hash computation happens in the browser — no servers, no trust required.
>
> Thank you."

---

### RECORDING TIPS

- Record at 1920×1080, 30fps
- Use OBS Studio or Loom
- Keep MetaMask window small and positioned so it doesn't cover the dApp
- Pause briefly after each action to let the UI update before speaking
- Upload to YouTube (unlisted) or Google Drive and paste the link in your PDF report
