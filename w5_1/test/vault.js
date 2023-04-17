const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");

let token2612Contracts;
let vault2612Contracts;
let account;
let account1;
let account2;


describe("MainTest", function () {
    async function init() {
        const TokenERC20Permit = await ethers.getContractFactory("TokenERC20Permit");
        token2612Contracts = await TokenERC20Permit.deploy();
        await token2612Contracts.deployed();
        console.log("token2612:" + token2612Contracts.address);

        const Vault2612 = await ethers.getContractFactory("Vault")
        vault2612Contracts = await Vault2612.deploy(token2612Contracts.address);
        await vault2612Contracts.deployed();
        console.log("vault2612:" + vault2612Contracts.address);

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
        account = owner;
        account1 = otherAccount;
        account2 = otherAccount2;
    }

    before(async function () {
        await init();
    })

    it("testTranslation2612", async function () {

        const nonce = await token2612Contracts.nonces(account.address);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
        const chainId = (await ethers.provider.getNetwork()).chainId;
        const domain = {
            name: 'Dawant Coin', version: '1', chainId, verifyingContract: token2612Contracts.address
        }

        const types = {
            Permit: [{name: "owner", type: "address"}, {name: "spender", type: "address"}, {
                name: "value",
                type: "uint256"
            }, {name: "nonce", type: "uint256"}, {name: "deadline", type: "uint256"},],
        };

        const message = {
            owner: account.address, spender: vault2612Contracts.address, value: 100, nonce: nonce, deadline: deadline,
        };

        const signature = await account._signTypedData(domain, types, message);
        const {v, r, s} = ethers.utils.splitSignature(signature);

        await expect(vault2612Contracts.permitDeposit(100, deadline, v, r, s)).to.changeTokenBalances(token2612Contracts, [account.address, vault2612Contracts.address], [-100, 100])
    })

    it("testTranslationToOwner", async function () {
        let tx = await token2612Contracts.approve(account2.address, 500);
        await tx.wait();

        await expect(token2612Contracts.transfer(account2.address, 500)).to.changeTokenBalances(token2612Contracts, [account.address, account2.address], [-500, 500])

        tx = await token2612Contracts.connect(account2).approve(vault2612Contracts.address, 500);
        await tx.wait();

        await expect(vault2612Contracts.connect(account2).deposit(500)).to.changeTokenBalances(token2612Contracts, [account2.address, vault2612Contracts.address], [-500, 500])

        await expect(vault2612Contracts.connect(account1).withdrawToOwner()).to.changeTokenBalances(token2612Contracts, [account.address, vault2612Contracts.address], [300, -300])
    })


})
