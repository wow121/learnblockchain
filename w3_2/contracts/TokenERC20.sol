// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract TokenERC20 is ERC20Upgradeable {

    function initialize() initializer public {
        __ERC20_init("Dawant Coin", "DTC");
        _mint(msg.sender, 6 * 10 ** decimals());
    }
}