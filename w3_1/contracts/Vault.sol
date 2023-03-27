// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

contract Vault {
    address public tokenAddress;
    mapping(address => uint) public balances;

    constructor(address addr) {
        tokenAddress = addr;
    }

    function deposit(uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function withdraw(uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        balances[msg.sender] -= amount;
        token.approve(address(this), amount);
        token.transferFrom(address(this), msg.sender, amount);
    }

    function permitDeposit(uint amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        IERC20Permit token = IERC20Permit(tokenAddress);
        token.permit(msg.sender, address(this), amount, deadline, v, r, s);
        deposit(amount);
    }

}
