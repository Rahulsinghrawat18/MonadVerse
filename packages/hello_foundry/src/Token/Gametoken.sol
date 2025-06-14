// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BabyMon is ERC20, Ownable {
    constructor() ERC20("BabyMon", "BMD") Ownable(msg.sender) {}

    //minting token
    function mintToken(address to,uint score) external  {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, score * 1 * 10 ** decimals()); // Mint 100 token with proper decimals
    }

    function getBalance(address account) external view returns (uint256) {
        return super.balanceOf(account);
    }
}