const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
const {Interface, FormatTypes} = require("ethers/lib/utils");
const hre = require("hardhat");

const uniswapRouterAbi = require(`../abi/uniswapV2Router.json`)
const uniswapPairAbi = require(`../abi/uniswapV2Pair.json`)
const usdtAbi = require(`../abi/usdt.json`)
const {ether} = require("@openzeppelin/test-helpers");
const {time} = require("@nomicfoundation/hardhat-network-helpers");


let uniswapV2RouteContracts;
let uniswapV2PairContracts;
let myTokenMarketContracts;
let optionsTokenContracts;
let usdtContracts;

let account;
let account1;
let account2;
let mockAccount;

describe("MainTest", function () {
    async function init() {
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account = owner;
        account1 = otherAccount;
        account2 = otherAccount2;

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount", params: ['0x06d3a30cBb00660B85a30988D197B1c282c6dCB6'],
        });
        mockAccount = await ethers.provider.getSigner('0x06d3a30cBb00660B85a30988D197B1c282c6dCB6');


        const OptionsToken = await ethers.getContractFactory("OptionsToken");
        optionsTokenContracts = await OptionsToken.deploy(1000, Math.floor(new Date().getTime() / 1000) + 1000, "0xdac17f958d2ee523a2206206994597c13d831ec7");
        await optionsTokenContracts.deployed();
        console.log("optionsToken:" + optionsTokenContracts.address);

        let iface = new Interface(uniswapRouterAbi);
        let humAbi = iface.format(FormatTypes.full);

        uniswapV2RouteContracts = new ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Route:" + uniswapV2RouteContracts.address);

        const MyTokenMarketContracts = await ethers.getContractFactory("MyTokenMarket")
        myTokenMarketContracts = await MyTokenMarketContracts.deploy(optionsTokenContracts.address, uniswapV2RouteContracts.address, "0xdac17f958d2ee523a2206206994597c13d831ec7");
        await myTokenMarketContracts.deployed();
        console.log("market:" + myTokenMarketContracts.address);

        iface = new Interface(uniswapPairAbi);
        humAbi = iface.format(FormatTypes.full);

        uniswapV2PairContracts = new ethers.Contract(await myTokenMarketContracts.pairAddress(), humAbi, ethers.providers.getDefaultProvider());
        console.log("uniswapV2Pair:" + uniswapV2PairContracts.address);

        iface = new Interface(usdtAbi);
        humAbi = iface.format(FormatTypes.full);

        usdtContracts = new ethers.Contract("0xdac17f958d2ee523a2206206994597c13d831ec7", humAbi, ethers.providers.getDefaultProvider());
        console.log("usdt:" + usdtContracts.address);


    }

    before(async function () {
        await init();
    })

    it("testMintOptionsToken", async function () {
        let tx;

        //先给期权合约转入1个eth
        await expect(account.sendTransaction({
            to: optionsTokenContracts.address, value: ethers.utils.parseEther("1")
        })).to.changeEtherBalances([account.address, optionsTokenContracts.address], [ethers.utils.parseEther("-1"), ethers.utils.parseEther("1")])

        //期望获得1000个期权token
        await expect(await optionsTokenContracts.connect(account).balanceOf(account.address)).to.be.equal(ethers.utils.parseEther("1"));


    })

    it("testAddLiquidity", async function () {


        let tx;

        //从mock账户转入1000个USDT
        tx = await usdtContracts.connect(mockAccount).transfer(account.address, 1000 * 10 ** 6);
        tx.wait();

        //期望获得1000个USDT
        await expect(await usdtContracts.connect(account).balanceOf(account.address)).to.be.equal(1000 * 10 ** 6);

        //授权markek合约可操作期货Token
        tx = await optionsTokenContracts.connect(account).approve(myTokenMarketContracts.address, ethers.utils.parseEther("1"));
        tx.wait();

        //授权markek合约可操作USDT
        tx = await usdtContracts.connect(account).approve(myTokenMarketContracts.address, 1000 * 10 ** 6);
        tx.wait();
        //添加流动性
        tx = await myTokenMarketContracts.connect(account).addLiquidity(ethers.utils.parseEther("1"), 100 * 10 ** 6);
        tx.wait();
        //检查流动性凭证
        await expect(await uniswapV2PairContracts.connect(account).balanceOf(account.address)).to.be.equal(ethers.BigNumber.from("9999999999000"));

    })

    it("testBuyToken", async function () {
        let tx;

        //给另一个账号转5000USDT
        tx = await usdtContracts.connect(mockAccount).transfer(account1.address, 5000 * 10 ** 6);
        tx.wait();

        //检查余额
        await expect(await usdtContracts.connect(account1).balanceOf(account1.address)).to.be.equal(5000 * 10 ** 6);

        //授权markek合约可操作USDT
        tx = await usdtContracts.connect(account1).approve(myTokenMarketContracts.address, 500 * 10 ** 6);
        tx.wait();

        //购买期权Token
        await expect(myTokenMarketContracts.connect(account1).buyToken(50 * 10 ** 6)).to.changeTokenBalance(optionsTokenContracts, account1, ethers.BigNumber.from("332665999332665999"));
    })

    it("testExerciseToken", async function () {
        let tx;

        tx = await usdtContracts.connect(account1).approve(optionsTokenContracts.address, 1000 * 10 ** 6);
        tx.wait();

        //尝试提前行权,返回失败
        let exercise = optionsTokenContracts.connect(account1).exercise(ethers.utils.parseEther("0.1"))
        await expect(exercise).eventually.to.rejectedWith(Error);

        //快进时间到期权行权时间
        await time.increaseTo(Math.floor(new Date().getTime() / 1000) + 1000);

        //行权
        await expect(await optionsTokenContracts.connect(account1).exercise(ethers.utils.parseEther("0.1"))).to.changeEtherBalances([account1, optionsTokenContracts], [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("-0.1")])
    })

    it("testBurnAll", async function () {
        let tx;
        //销毁所有期权Token
        tx = await optionsTokenContracts.connect(account).destroy()
        tx.wait();

        let func = optionsTokenContracts.balanceOf(account.address)

        await expect(func).eventually.to.rejectedWith(Error);
    })

})
