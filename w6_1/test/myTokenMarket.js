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
let sushiTokenContracts;
let masterChefContracts;


let account;
let account1;
let account2;


describe("MainTest", function () {
    async function init() {
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account = owner;
        account1 = otherAccount;
        account2 = otherAccount2;


        const TokenERC20Permit = await ethers.getContractFactory("TokenERC20Permit");
        token2612Contracts = await TokenERC20Permit.deploy();
        await token2612Contracts.deployed();
        console.log("token2612:" + token2612Contracts.address);

        let iface = new Interface(uniswapRouterAbi);
        let humAbi = iface.format(FormatTypes.full);

        uniswapV2RouteContracts = new ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Route:" + uniswapV2RouteContracts.address);


        const sushiToken = await ethers.getContractFactory("SushiToken");
        sushiTokenContracts = await sushiToken.deploy();
        await sushiTokenContracts.deployed();
        console.log("suhiToken:" + sushiTokenContracts.address);


        const masterChef = await ethers.getContractFactory("MasterChef");
        masterChefContracts = await masterChef.deploy(sushiTokenContracts.address, account.address, 1000000, 17081164, 17081164 + 600000);
        await masterChefContracts.deployed();
        console.log("masterChef:" + masterChefContracts.address);


        let tx = await sushiTokenContracts.transferOwnership(masterChefContracts.address);
        tx.wait();

        const MyTokenMarketContracts = await ethers.getContractFactory("MyTokenMarket")
        myTokenMarketContracts = await MyTokenMarketContracts.deploy(token2612Contracts.address, uniswapV2RouteContracts.address, masterChefContracts.address);
        await myTokenMarketContracts.deployed();
        console.log("market:" + myTokenMarketContracts.address);

        iface = new Interface(uniswapPairAbi);
        humAbi = iface.format(FormatTypes.full);

        uniswapV2PairContracts = new ethers.Contract(await myTokenMarketContracts.pairAddress(), humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Pair:" + uniswapV2PairContracts.address);

        iface = new Interface(wethAbi);
        humAbi = iface.format(FormatTypes.full);

        wethContracts = new ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", humAbi, ethers.providers.getDefaultProvider());
        console.log("weth:" + wethContracts.address);


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

    it("testBuyTokenDeposit", async function () {
        let tx;

        tx = await masterChefContracts.connect(account).add(10000, token2612Contracts.address, true);
        tx.wait();

        tx = await myTokenMarketContracts.connect(account).buyTokenDeposit(0, 100);
        tx.wait();

        await expect(await myTokenMarketContracts.connect(account).balances(account.address)).to.be.equal(96);
    })


    it("testWithdraw", async function () {
        let tx;
        await expect(myTokenMarketContracts.connect(account).withdrawToken(0,96)).to.changeTokenBalance(token2612Contracts, account, 96);
    })
})
