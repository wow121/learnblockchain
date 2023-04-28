const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
const {Interface, FormatTypes} = require("ethers/lib/utils");
const hre = require("hardhat");

const uniswapRouterAbi = require(`../abi/uniswapV2Router.json`)
const uniswapPairAbi = require(`../abi/uniswapV2Pair.json`)
const usdtAbi = require(`../abi/usdt.json`)
const {ether} = require("@openzeppelin/test-helpers");
const {time} = require("@nomicfoundation/hardhat-network-helpers");


let deflationTokenContracts;

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


        const DeflationToken = await ethers.getContractFactory("DeflationToken");
        deflationTokenContracts = await DeflationToken.deploy();
        await deflationTokenContracts.deployed();
        console.log("DeflationToken:" + deflationTokenContracts.address);

    }

    before(async function () {
        await init();
    })

    it("testBalanceChange", async function () {
        let tx;

        //检查余额
        await expect(await deflationTokenContracts.balanceOf(account.address)).to.be.equal(ethers.utils.parseEther("50000000"));

        //时间没到预期通缩失败
        let rebase = deflationTokenContracts.rebase();
        await expect(rebase).eventually.to.rejectedWith(Error);

        //快进时间到一年后
        await time.increaseTo(Math.floor(new Date().getTime() / 1000) + 31536000);

        //通缩
        tx = await deflationTokenContracts.rebase();
        tx.wait();

        //检查余额
        await expect(await deflationTokenContracts.balanceOf(account.address)).to.be.equal(ethers.utils.parseEther("49500000"));
    })

})
