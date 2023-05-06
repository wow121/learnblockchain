// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {

    constructor() payable {
    }

    receive() external payable {

    }

    function withdraw(uint amount) public onlyOwner {
        safeTransferETH(msg.sender, amount);
    }

    function withdrawTo(address to, uint amount) public onlyOwner {
        safeTransferETH(to, amount);
    }

    function safeTransferETH(address to, uint256 value) internal {
        (bool success,) = to.call{value : value}(new bytes(0));
        require(success, 'TransferHelper::safeTransferETH: ETH transfer failed');
    }
}