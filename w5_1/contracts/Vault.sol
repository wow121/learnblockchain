// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract Vault is AutomationCompatible {
    address public tokenAddress;
    mapping(address => uint) public balances;
    address public owner;

    constructor(address addr) {
        tokenAddress = addr;
        owner = msg.sender;
    }

    function deposit(uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function withdraw(uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        balances[msg.sender] -= amount;
        //        token.approve(address(this), amount);
        //        token.transferFrom(address(this), msg.sender, amount);
        token.transfer(msg.sender, amount);
    }


    function withdrawToOwner() public {
        IERC20 token = IERC20(tokenAddress);
        uint amount = token.balanceOf(address(this)) / 2;
        token.transfer(owner, amount);
    }

    function checkUpkeep(bytes calldata checkData) public view returns (bool, bytes memory){
        IERC20 token = IERC20(tokenAddress);
        return (token.balanceOf(address(this)) > 100, bytes(""));
    }

    function performUpkeep(bytes calldata) external override {
        IERC20 token = IERC20(tokenAddress);
        if (token.balanceOf(address(this)) > 100) {
            withdrawToOwner();
        }
    }

    function permitDeposit(uint amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        IERC20Permit token = IERC20Permit(tokenAddress);
        token.permit(msg.sender, address(this), amount, deadline, v, r, s);
        deposit(amount);
    }

}
