const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");
let bank;
let account1;
let account2;

describe("Bank", function () {
    async function init() {
        const Bank = await ethers.getContractFactory("Bank");
        bank = await Bank.deploy();
        await bank.deployed();
        console.log("bank:" + bank.address);
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account1 = otherAccount;
        account2 = otherAccount2;
    }

    before(async function () {
        await init();
    })

    it("translation", async function () {
        await expect(account1.sendTransaction({
            to: bank.address,
            value: ethers.utils.parseEther("1")
        })).to.changeEtherBalances([account1.address, bank.address], [ethers.utils.parseEther("-1"), ethers.utils.parseEther("1")])
    })

    it("withdrawFail", async function () {
        let withdraw = bank.connect(account1).withdraw(ethers.utils.parseEther("2"))
        await expect(withdraw).eventually.to.rejectedWith(Error)
    })

    it("withdrawSuccess", async function () {
        let tx = await bank.connect(account1).withdraw(ethers.utils.parseEther("1"))
        await tx.wait();

        await expect(await bank.balances(account1.address)).to.equal(0)
    })

    // it("rugSuccess", async function () {
    //     let tx1 = await account1.sendTransaction({
    //         to: bank.address,
    //         value: ethers.utils.parseEther("1")
    //     })
    //     tx1.wait()
    //
    //     let tx2 = await account2.sendTransaction({
    //         to: bank.address,
    //         value: ethers.utils.parseEther("1")
    //     })
    //     tx2.wait()
    //
    //     await expect(await bank.getBalance()).to.equal(ethers.utils.parseEther("2"))
    // })

})
