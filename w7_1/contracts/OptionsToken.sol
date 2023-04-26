// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OptionsToken is ERC20, ERC20Permit, Ownable {

    uint public price;
    uint public endTime;

    constructor(uint _price, uint _endTime) ERC20("Dawant Coin D", "DTCD") ERC20Permit("Dawant Coin D") {
        //        _mint(msg.sender, 100000000 * 10 ** decimals());
        price = _price;
        endTime = _endTime;
    }

    receive() external payable {
        require(block.timestamp < endTime, "The option has expired");
        uint amount = msg.value * price;
        _mint(msg.sender, amount);
    }

    function exercise(uint amount) public {
        require(amount > price, "The amount is too small");
        require(block.timestamp > endTime, "The option has not expired yet");
        _burn(msg.sender, amount);
        safeTransferETH(msg.sender, amount / price);
    }


    function safeTransferETH(address to, uint256 value) internal {
        (bool success,) = to.call{value : value}(new bytes(0));
        require(success, 'TransferHelper::safeTransferETH: ETH transfer failed');
    }

    function destroy() public onlyOwner {
        require(block.timestamp > endTime, "The option has not expired yet");
        selfdestruct(payable(owner()));
    }

}
