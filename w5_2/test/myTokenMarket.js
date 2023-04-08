const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
const {Interface, FormatTypes} = require("ethers/lib/utils");

const uniswapRouterAbi = require(`../abi/uniswapV2Router.json`)
const uniswapPairAbi = require(`../abi/uniswapV2Pair.json`)
const wethAbi = require(`../abi/weth.json`)
const {ether} = require("@openzeppelin/test-helpers");


let token2612Contracts;
let myTokenMarketContracts;
let uniswapV2RouteContracts;
let uniswapV2PairContracts;
let wethContracts;

let account;
let account1;
let account2;


describe("MainTest", function () {
    async function init() {
        const TokenERC20Permit = await ethers.getContractFactory("TokenERC20Permit");
        token2612Contracts = await TokenERC20Permit.deploy();
        await token2612Contracts.deployed();
        console.log("token2612:" + token2612Contracts.address);

        let iface = new Interface(uniswapRouterAbi);
        let humAbi = iface.format(FormatTypes.full);

        uniswapV2RouteContracts = new ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Route:" + uniswapV2RouteContracts.address);

        const MyTokenMarketContracts = await ethers.getContractFactory("MyTokenMarket")
        myTokenMarketContracts = await MyTokenMarketContracts.deploy(token2612Contracts.address, uniswapV2RouteContracts.address);
        await myTokenMarketContracts.deployed();
        console.log("market:" + myTokenMarketContracts.address);

        iface = new Interface(uniswapPairAbi);
        humAbi = iface.format(FormatTypes.full);

        uniswapV2PairContracts = new ethers.Contract(await myTokenMarketContracts.pairAddress(), humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Pair:" + uniswapV2PairContracts.address);

        iface = new Interface(wethAbi);
        humAbi = iface.format(FormatTypes.full);

        wethContracts = new ethers.Contract(await uniswapV2RouteContracts.WETH(), humAbi, ethers.providers.getDefaultProvider());
        console.log("weth:" + wethContracts.address);


        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account = owner;
        account1 = otherAccount;
        account2 = otherAccount2;
    }

    before(async function () {
        await init();
    })

    it("testAddLiquidity", async function () {
        let tx;
        await expect(wethContracts.connect(account).deposit({value: 10000000000})).to.changeEtherBalances([account.address, wethContracts.address], [-10000000000, 10000000000])

        tx = await wethContracts.connect(account).approve(myTokenMarketContracts.address, 100000);
        tx.wait();

        tx = await token2612Contracts.connect(account).approve(myTokenMarketContracts.address, 100000000);
        tx.wait();

        tx = await myTokenMarketContracts.connect(account).addLiquidity(10000, 10000);
        tx.wait();

        await expect(await uniswapV2PairContracts.connect(account).balanceOf(account.address)).to.be.equal(9000);

    })

    it("testBuyToken", async function () {

        let tx;

        await expect(myTokenMarketContracts.connect(account).buyToken(100)).to.changeTokenBalance(token2612Contracts, account, 98);

    })

})
