// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract TokenERC20Permit is ERC20, ERC20Permit {
    constructor() ERC20("Dawant Coin B", "DTCB") ERC20Permit("Dawant Coin B") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }
}
