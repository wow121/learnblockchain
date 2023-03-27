// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract TokenERC20Permit is ERC20, ERC20Permit {
    constructor() ERC20("Dawant Coin", "DTC") ERC20Permit("Dawant Coin") {
        _mint(msg.sender, 6 * 10 ** decimals());
    }
}
