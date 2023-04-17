// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract MyTokenMarket {
    address public tokenAddress;
    address public uniswapRouterAddress;
    address public pairAddress;

    constructor(address addr, address uniswapRouterAddr) {
        tokenAddress = addr;
        uniswapRouterAddress = uniswapRouterAddr;

        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(uniswapRouter.factory());
        pairAddress = factory.createPair(tokenAddress, uniswapRouter.WETH());
    }

    function addLiquidity(uint amountA, uint amountB) public {

        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), amountA);
        token.approve(uniswapRouterAddress, amountA);

        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);
        IERC20 weth = IERC20(uniswapRouter.WETH());
        weth.transferFrom(msg.sender, address(this), amountB);
        weth.approve(uniswapRouterAddress, amountB);

        uniswapRouter.addLiquidity(
            tokenAddress,
            uniswapRouter.WETH(),
            amountA,
            amountB,
            0,
            0,
            msg.sender,
            block.timestamp
        );
    }

    function buyToken(uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);

        IERC20 weth = IERC20(uniswapRouter.WETH());
        weth.transferFrom(msg.sender, address(this), amount);
        weth.approve(uniswapRouterAddress, amount);

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;
        uniswapRouter.swapExactTokensForTokens(
            amount,
            0,
            path,
            msg.sender,
            block.timestamp
        );
    }


}