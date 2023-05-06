const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
const {Interface, FormatTypes} = require("ethers/lib/utils");
const hre = require("hardhat");

const {ether} = require("@openzeppelin/test-helpers");
const {time} = require("@nomicfoundation/hardhat-network-helpers");
const {BigNumber} = require("ethers");


let treasuryContracts;
let myTokenContracts;
let timeControllerContracts;
let govContracts;

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


        const Treasury = await ethers.getContractFactory("Treasury");
        treasuryContracts = await Treasury.deploy({value: ethers.utils.parseEther("100")});
        await treasuryContracts.deployed();
        console.log("treasuryContracts:" + treasuryContracts.address);


        const MyToken = await ethers.getContractFactory("VotesToken");
        myTokenContracts = await MyToken.deploy();
        await myTokenContracts.deployed();
        console.log("myTokenContracts:" + myTokenContracts.address);

        const TimeController = await ethers.getContractFactory("MyTimeLockController");
        timeControllerContracts = await TimeController.deploy(0, [], [], account.address);
        await timeControllerContracts.deployed();
        console.log("timeControllerContracts:" + timeControllerContracts.address);

        const Gov = await ethers.getContractFactory("Gov");
        govContracts = await Gov.deploy(myTokenContracts.address, timeControllerContracts.address);
        await govContracts.deployed();
        console.log("govContracts:" + govContracts.address);

        let tx = await timeControllerContracts.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE")), govContracts.address);
        await tx.wait()

        tx = await timeControllerContracts.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSER_ROLE")), govContracts.address);
        await tx.wait()

        tx = await myTokenContracts.transfer(account1.address, ethers.utils.parseEther("5"));
        await tx.wait()

        tx = await myTokenContracts.connect(account1).transfer(account.address, ethers.utils.parseEther("1"));
        await tx.wait()

        tx = await myTokenContracts.connect(account1).delegate(account.address);
        await tx.wait()
    }

    before(async function () {
        await init();
    })

    it("testWithdraw", async function () {
        await expect(await treasuryContracts.withdraw(ethers.utils.parseEther("1"))).to.changeEtherBalance(account, ethers.utils.parseEther("1"));
    })

    it("testCreateProposal", async function () {
        let tx;
        tx = await treasuryContracts.transferOwnership(timeControllerContracts.address);
        await tx.wait();

        await expect(await treasuryContracts.owner()).to.be.equal(timeControllerContracts.address);

        const targets = [treasuryContracts.address];
        const values = [0];
        const calldatas = [treasuryContracts.interface.encodeFunctionData("withdrawTo", [account.address, ethers.utils.parseEther("1")])];

        // tx=await govContracts["propose(address[],uint256[],bytes[],string)"](targets, values, calldatas, "test");
        // const result=await tx.wait();
        // console.log(result.events[0].args.proposalId);

        await expect(await govContracts["propose(address[],uint256[],bytes[],string)"](targets, values, calldatas, "test")).to.emit(govContracts, "ProposalCreated");
    })

    it("testVote", async function () {
        // let tx = await govContracts.connect(account).castVote(BigNumber.from("27257450554567591202266603128673491376731121256379638598077182814742307825086"), 1);
        // const result = await tx.wait();
        // console.log(result.events[0].args);

        // let value = await myTokenContracts.getVotes(account.address);
        // console.log("votes:" + value);


        // console.log("balanceOf:" + await myTokenContracts.balanceOf(account.address));
        // console.log("numCheckpoints:" + await myTokenContracts.numCheckpoints(account.address));
        // console.log("block:" + await myTokenContracts.(account1.address));
        // console.log(await myTokenContracts.checkpoints(account.address,1));
        // console.log(await myTokenContracts.checkpoints(account.address,2));
        await expect(await govContracts.castVote(BigNumber.from("27257450554567591202266603128673491376731121256379638598077182814742307825086"), 1)).to.emit(govContracts, "VoteCast");
    })

    it("testExecute", async function () {

        // const targets = [treasuryContracts.address];
        // const values = [0];
        // const calldatas = [treasuryContracts.interface.encodeFunctionData("withdrawTo", [account.address, ethers.utils.parseEther("1")])];
        // console.log(govContracts);


        await time.increaseTo(Math.floor(new Date().getTime() / 1000) + 24000);

        let tx = await govContracts["queue(uint256)"](BigNumber.from("27257450554567591202266603128673491376731121256379638598077182814742307825086"));
        await tx.wait()

        await expect(await govContracts["execute(uint256)"](BigNumber.from("27257450554567591202266603128673491376731121256379638598077182814742307825086"))).to.changeEtherBalance(account, ethers.utils.parseEther("1"));
    })

})
