// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ALULogoToken
 * @notice ERC-20 token representing ownership shares of the ALU logo.
 *         Fixed supply of 1,000,000 ALUT, all minted to the logo owner.
 */
contract ALULogoToken is ERC20, Ownable {
    // 1,000,000 whole tokens (decimals() = 18, so 1,000,000 * 10^18 units)
    uint256 public constant TOTAL_TOKENS = 1_000_000;

    /**
     * @param logoOwner Wallet that receives the full supply and becomes owner.
     */
    constructor(address logoOwner)
        ERC20("ALU Logo Token", "ALUT")
        Ownable(logoOwner)
    {
        _mint(logoOwner, TOTAL_TOKENS * 10 ** decimals());
    }

    /**
     * @notice Give ownership shares to a stakeholder. Owner only.
     * @param recipient Wallet receiving the shares
     * @param amount    Number of WHOLE ALUT tokens (e.g. 100000)
     */
    function distributeShares(address recipient, uint256 amount)
        public
        onlyOwner
    {
        require(amount > 0, "Amount must be greater than zero");
        _transfer(owner(), recipient, amount * 10 ** decimals());
    }

    /**
     * @notice Ownership percentage of a wallet as a whole number.
     *         500,000 tokens out of 1,000,000 returns 50.
     */
    function ownershipPercentage(address account)
        public
        view
        returns (uint256)
    {
        return (balanceOf(account) * 100) / totalSupply();
    }
}
