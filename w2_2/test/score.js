const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
let contract;
let account1;
let account2;

let scoreContract;

describe("MainTest", function () {
    async function init() {
        const Contracts = await ethers.getContractFactory("Teacher");
        contract = await Contracts.deploy();
        await contract.deployed();
        console.log("contract:" + contract.address);
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account1 = otherAccount;
        account2 = otherAccount2;
    }

    before(async function () {
        await init();
    })

    it("testCreateScore", async function () {
        let tx = await contract.createScore();
        await tx.wait()

        scoreContract = await contract.scoreArray(0)
        await expect(scoreContract.length).to.be.equal(42);
    })

    it("testSetScore", async function () {
        let tx = await contract.setScore(account1.address, 10);
        await tx.wait();

        let score = await ethers.getContractAt("Score", scoreContract)
        expect(await score.scores(account1.address)).to.be.equal(10);
    })

    it("testSetScoreFail", async function () {
        let setScore = contract.setScore(account1.address, 101);
        await expect(setScore).eventually.to.rejectedWith(Error);
    })

    it("testOtherSetScore", async function () {
        let score = await ethers.getContractAt("Score", scoreContract)
        let setScore = score.connect(account1).setScore(account1.address, 10);
        await expect(setScore).eventually.to.rejectedWith(Error);
    })

})
