// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./IMasterChef.sol";


contract MyTokenMarket {
    address public tokenAddress;
    address public uniswapRouterAddress;
    address public pairAddress;
    address  public masterChefAddress;
    mapping(address => uint) public balances;


    constructor(address addr, address uniswapRouterAddr, address _masterChef){
        tokenAddress = addr;
        uniswapRouterAddress = uniswapRouterAddr;

        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);
        IUniswapV2Factory factory = IUniswapV2Factory(uniswapRouter.factory());
        pairAddress = factory.createPair(tokenAddress, uniswapRouter.WETH());

        masterChefAddress = _masterChef;
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

    function buyToken(uint amount) public returns (uint[] memory amounts){
        IERC20 token = IERC20(tokenAddress);
        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);

        IERC20 weth = IERC20(uniswapRouter.WETH());
        weth.transferFrom(msg.sender, address(this), amount);
        weth.approve(uniswapRouterAddress, amount);

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;
        return uniswapRouter.swapExactTokensForTokens(
            amount,
            0,
            path,
            msg.sender,
            block.timestamp
        );
    }

    function buyTokenDeposit(uint pid, uint amount) public {
        //先不考虑sushi了。。
        //存款可能会产生sushiToken，所以先获取之前的值
//        IERC20 sushiToken = IERC20(masterChef.sushi());
//        uint beforeSushi = sushiToken.balanceOf(address(this));

        IERC20 token = IERC20(tokenAddress);
        IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(uniswapRouterAddress);

        IERC20 weth = IERC20(uniswapRouter.WETH());
        weth.transferFrom(msg.sender, address(this), amount);
        weth.approve(uniswapRouterAddress, amount);

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;
        uint[] memory result = uniswapRouter.swapExactTokensForTokens(
            amount,
            0,
            path,
            address(this),
            block.timestamp
        );
        uint count = result[result.length - 1];

        token.approve(masterChefAddress, count);

        IMasterChef masterChef= IMasterChef(masterChefAddress);
        masterChef.deposit(pid, count);

        balances[msg.sender] += count;
    }

    function withdrawToken(uint pid, uint amount) public {
        balances[msg.sender] -= amount;

        IMasterChef masterChef= IMasterChef(masterChefAddress);
        masterChef.withdraw(pid, amount);

        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, amount);
    }



}