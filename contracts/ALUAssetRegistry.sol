// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ALUAssetRegistry
 * @notice Registers digital assets (e.g. the ALU logo) as ERC-721 NFTs.
 *         Each NFT stores the file's SHA-256 fingerprint, the registrant
 *         and the registration time, so anyone can verify authenticity.
 */
contract ALUAssetRegistry is ERC721 {
    // ---------- Data structure ----------
    struct AssetMetadata {
        string assetName;      // e.g. "ALU Official Logo"
        string fileType;       // e.g. "png"
        bytes32 contentHash;   // SHA-256 hash of the file
        address registeredBy;  // wallet that registered the asset
        uint256 timestamp;     // Unix time of registration
    }

    // ---------- State ----------
    uint256 private _tokenCounter; // last token ID issued

    // token ID => registration details
    mapping(uint256 => AssetMetadata) private _assets;

    // content hash => already registered? (blocks duplicates)
    mapping(bytes32 => bool) private _hashRegistered;

    // ---------- Events ----------
    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed registeredBy,
        bytes32 contentHash,
        string assetName
    );

    constructor() ERC721("ALU Asset Registry", "ALUA") {}

    /**
     * @notice Register a new asset and mint an NFT for the caller.
     * @param assetName   Human-readable name of the asset
     * @param fileType    File extension / type
     * @param contentHash SHA-256 hash of the file
     * @return tokenId    ID of the newly minted NFT
     */
    function registerAsset(
        string memory assetName,
        string memory fileType,
        bytes32 contentHash
    ) public returns (uint256) {
        // Reject duplicates
        require(
            !_hashRegistered[contentHash],
            "Asset already registered: duplicate content hash"
        );

        _tokenCounter++;
        uint256 newTokenId = _tokenCounter;

        // Mint the NFT to the caller
        _safeMint(msg.sender, newTokenId);

        // Save metadata and mark hash as used
        _assets[newTokenId] = AssetMetadata({
            assetName: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp
        });
        _hashRegistered[contentHash] = true;

        emit AssetRegistered(newTokenId, msg.sender, contentHash, assetName);
        return newTokenId;
    }

    /**
     * @notice Check whether a supplied hash matches the registered one.
     * @dev View function: free to call off-chain.
     */
    function verifyLogoIntegrity(uint256 tokenId, bytes32 contentHash)
        public
        view
        returns (bool, string memory)
    {
        // Reverts if the token does not exist
        _requireOwned(tokenId);

        if (_assets[tokenId].contentHash == contentHash) {
            return (true, "Logo is authentic.");
        }
        return (false, "Warning: logo does not match.");
    }

    /**
     * @notice Return the full registration record of a token.
     */
    function getAsset(uint256 tokenId)
        public
        view
        returns (AssetMetadata memory)
    {
        _requireOwned(tokenId);
        return _assets[tokenId];
    }
}
