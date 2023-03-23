// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TokenERC20 is ERC20 {
    constructor() ERC20("Dawant Coin", "DTC") {
        _mint(msg.sender, 6 * 10 ** decimals());
    }

}