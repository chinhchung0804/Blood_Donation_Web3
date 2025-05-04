// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MTKToken is ERC20 {
    constructor() ERC20("MTK Token", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** 18); // Mint 1,000,000 MTK cho người deploy
    }
}