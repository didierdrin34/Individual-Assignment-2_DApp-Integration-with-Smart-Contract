const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Real logo hash, computed from alu-logo.png
const logoBuffer = fs.readFileSync(path.join(__dirname, "..", "alu-logo.png"));
const LOGO_HASH = "0x" + crypto.createHash("sha256").update(logoBuffer).digest("hex");
const FAKE_HASH = "0x" + crypto.createHash("sha256").update("modified logo").digest("hex");

describe("ALU Logo Project", function () {
  let registry, token, owner, alice;

  beforeEach(async function () {
    [owner, alice] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("ALUAssetRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();

    const Token = await ethers.getContractFactory("ALULogoToken");
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();
  });

  // ─── Formative 1: ALUAssetRegistry (ERC-721) ───────────────────────────────

  describe("ALUAssetRegistry (ERC-721)", function () {
    it("1. registers the ALU logo and returns a token ID", async function () {
      const tokenId = await registry.registerAsset.staticCall("ALU Official Logo", "png", LOGO_HASH);
      expect(tokenId).to.equal(1n);
      await expect(registry.registerAsset("ALU Official Logo", "png", LOGO_HASH))
        .to.emit(registry, "AssetRegistered");
      expect(await registry.ownerOf(1)).to.equal(owner.address);
    });

    it("2. rejects registering the same hash twice", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      await expect(
        registry.registerAsset("ALU Official Logo", "png", LOGO_HASH)
      ).to.be.revertedWith("Asset already registered: duplicate content hash");
    });

    it("3. verifyLogoIntegrity returns true for the correct hash", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      const [ok, message] = await registry.verifyLogoIntegrity(1, LOGO_HASH);
      expect(ok).to.equal(true);
      expect(message).to.equal("Logo is authentic.");
    });

    it("4. verifyLogoIntegrity returns false for an incorrect hash", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      const [ok, message] = await registry.verifyLogoIntegrity(1, FAKE_HASH);
      expect(ok).to.equal(false);
      expect(message).to.equal("Warning: logo does not match.");
    });

    it("5. getAsset returns the correct name and file type", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      const asset = await registry.getAsset(1);
      expect(asset.assetName).to.equal("ALU Official Logo");
      expect(asset.fileType).to.equal("png");
      expect(asset.contentHash).to.equal(LOGO_HASH);
      expect(asset.registeredBy).to.equal(owner.address);
    });
  });

  // ─── Formative 1: ALULogoToken (ERC-20) ────────────────────────────────────

  describe("ALULogoToken (ERC-20)", function () {
    it("6. mints the full 1,000,000 ALUT to the logo owner", async function () {
      const expected = ethers.parseUnits("1000000", 18);
      expect(await token.totalSupply()).to.equal(expected);
      expect(await token.balanceOf(owner.address)).to.equal(expected);
    });

    it("7. distributeShares transfers tokens to a recipient", async function () {
      await token.distributeShares(alice.address, 100000);
      expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("100000", 18));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("900000", 18));
    });

    it("8. ownershipPercentage returns the correct percentage", async function () {
      await token.distributeShares(alice.address, 500000);
      expect(await token.ownershipPercentage(alice.address)).to.equal(50n);
    });
  });

  // ─── Assignment 2: Frontend Integration Tests ──────────────────────────────

  describe("Frontend Integration Tests", function () {
    it("9. frontend reads total ALUT supply and it equals 1,000,000", async function () {
      const supply = await token.totalSupply();
      const formatted = ethers.formatUnits(supply, 18);
      expect(parseFloat(formatted)).to.equal(1_000_000);
    });

    it("10. SHA-256 hash of alu-logo.png is a valid bytes32 hex string", async function () {
      expect(LOGO_HASH).to.match(/^0x[0-9a-f]{64}$/);
      expect(LOGO_HASH.length).to.equal(66);
    });

    it("11. verifyLogoIntegrity returns success result for the correct ALU logo hash", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      const [ok] = await registry.verifyLogoIntegrity(1, LOGO_HASH);
      expect(ok).to.equal(true);
      const frontendResult = ok
        ? "Logo Verified: This is the authentic ALU logo."
        : "Warning: This logo has been modified.";
      expect(frontendResult).to.include("Logo Verified");
    });

    it("12. verifyLogoIntegrity returns failure result for an incorrect hash", async function () {
      await registry.registerAsset("ALU Official Logo", "png", LOGO_HASH);
      const [ok] = await registry.verifyLogoIntegrity(1, FAKE_HASH);
      expect(ok).to.equal(false);
      const frontendResult = ok
        ? "Logo Verified: This is the authentic ALU logo."
        : "Warning: This logo has been modified.";
      expect(frontendResult).to.include("Warning");
    });

    it("13. distributeShares correctly updates the recipient balance after transfer", async function () {
      expect(await token.balanceOf(alice.address)).to.equal(0n);
      await token.distributeShares(alice.address, 250000);
      expect(await token.balanceOf(alice.address)).to.equal(ethers.parseUnits("250000", 18));
      expect(await token.ownershipPercentage(alice.address)).to.equal(25n);
    });
  });
});
