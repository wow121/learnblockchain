const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat/internal/lib/hardhat-lib");


describe("MainTest", function () {
    async function init() {

    }

    before(async function () {
        await init();
    })

    it("testUpdate", async function () {

        const Contracts = await ethers.getContractFactory("TokenERC20");
        const tokenContracts = await upgrades.deployProxy(Contracts);
        await tokenContracts.deployed();
        const address = tokenContracts.address;
        console.log("token:" + tokenContracts.address);

        expect(tokenContracts).to.not.respondTo("transferWithCallback")


        const ContractsV1 = await ethers.getContractFactory("TokenERC20V_1");
        const tokenContractsV1 = await upgrades.upgradeProxy(address, ContractsV1);
        await tokenContractsV1.deployed();
        console.log("token upgraded");

        expect(tokenContractsV1).to.respondTo("transferWithCallback")
    })
})
