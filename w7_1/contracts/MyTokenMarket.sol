// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract MyTokenMarket {
    address public tokenAddress;
    address public uniswapRouterAddress;
    address public pairAddress;
    address public usdtAddress;


    constructor(address addr, address uniswapRouterAddr, address usdtAddr){
        tokenAddress = addr;
        uniswapRouterAddress = uniswapRouterAddr;

        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(uniswapRouter.factory());
        pairAddress = factory.createPair(tokenAddress, usdtAddr);

        usdtAddress = usdtAddr;
    }

    function addLiquidity(uint amountA, uint amountB) public {

        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), amountA);
        token.approve(uniswapRouterAddress, amountA);

        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);

        IERC20 usdt = IERC20(usdtAddress);
        //        usdt.transferFrom(msg.sender, address(this), amountB);
        //        usdt.approve(uniswapRouterAddress, amountB);

        SafeERC20.safeTransferFrom(usdt, msg.sender, address(this), amountB);
        SafeERC20.safeApprove(usdt, uniswapRouterAddress, amountB);


        uniswapRouter.addLiquidity(
            tokenAddress,
            usdtAddress,
            amountA,
            amountB,
            0,
            0,
            msg.sender,
            block.timestamp
        );
    }

    function buyToken(uint amount) public returns (uint[] memory amounts){
//        IERC20 token = IERC20(tokenAddress);
        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);

        IERC20 usdt = IERC20(usdtAddress);
        SafeERC20.safeTransferFrom(usdt, msg.sender, address(this), amount);
        SafeERC20.safeApprove(usdt, uniswapRouterAddress, amount);
        //        usdt.transferFrom(msg.sender, address(this), amount);
        //        usdt.approve(uniswapRouterAddress, amount);

        address[] memory path = new address[](2);
        path[0] = usdtAddress;
        path[1] = tokenAddress;
        return uniswapRouter.swapExactTokensForTokens(
            amount,
            0,
            path,
            msg.sender,
            block.timestamp
        );
    }


}