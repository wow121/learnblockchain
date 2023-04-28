// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OptionsToken is ERC20, ERC20Permit, Ownable {

    uint public price;
    uint public endTime;
    address public usdtAddress;

    constructor(uint _price, uint _endTime, address _usdtAddress) ERC20("Dawant Coin D", "DTCD") ERC20Permit("Dawant Coin D") {
        //        _mint(msg.sender, 100000000 * 10 ** decimals());
        price = _price;
        endTime = _endTime;
        usdtAddress = _usdtAddress;
    }

    receive() external payable {
        require(block.timestamp < endTime, "The option has expired");
        uint amount = msg.value;
        _mint(msg.sender, amount);
    }

    function exercise(uint amount) public {
        require(block.timestamp > endTime, "The option has not expired yet");
        _burn(msg.sender, amount);

        IERC20 usdt = IERC20(usdtAddress);

        //usdt和eth位数不一样,需要处理位数关系
        SafeERC20.safeTransferFrom(usdt, msg.sender, address(this), price * amount / 10 ** 12);

        safeTransferETH(msg.sender, amount);
    }


    function safeTransferETH(address to, uint256 value) internal {
        (bool success,) = to.call{value : value}(new bytes(0));
        require(success, 'TransferHelper::safeTransferETH: ETH transfer failed');
    }

    function destroy() public onlyOwner {
        require(block.timestamp > endTime, "The option has not expired yet");
        IERC20 usdt = IERC20(usdtAddress);
        uint usdtAmount = usdt.balanceOf(address(this));
        SafeERC20.safeTransfer(usdt, msg.sender, usdtAmount);

        selfdestruct(payable(owner()));
    }

}
