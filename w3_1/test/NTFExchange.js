const {expect} = require("chai");
const {ethers} = require("hardhat/internal/lib/hardhat-lib");

let token2612Contracts;
let token721Contracts;
let ntfExchangeContracts;
let account;
let account1;
let tokenId;

describe("MainTest", function () {
    async function init() {

        const TokenERC20Permit = await ethers.getContractFactory("TokenERC20Permit");
        token2612Contracts = await TokenERC20Permit.deploy();
        await token2612Contracts.deployed();
        console.log("token2612:" + token2612Contracts.address);

        const TokenERC721 = await ethers.getContractFactory("TokenERC721");
        token721Contracts = await TokenERC721.deploy();
        await token721Contracts.deployed();
        console.log("token721:" + token721Contracts.address)

        const NTFExchange = await ethers.getContractFactory("NTFExchange")
        ntfExchangeContracts = await NTFExchange.deploy(token2612Contracts.address, token721Contracts.address);
        await ntfExchangeContracts.deployed();
        console.log("NTFExchange:" + ntfExchangeContracts.address);

        const [owner, otherAccount] = await ethers.getSigners();
        account = owner;
        account1 = otherAccount;
    }

    before(async function () {
        await init();
    })

    it("testMint", async function () {

        let data = 'ipfs://QmPRq3fh851EYk7tgtPRh8qBfNHh5jFRCnKeUQb3w9spCM'

        let tx = await token721Contracts.mintNFT(account.address, data);

        let event = await tx.wait();

        tokenId = event.events.find(event => {
            return event.event === 'Transfer'
        }).args["tokenId"].toNumber();

        await expect(await token721Contracts.ownerOf(tokenId)).to.equal(account.address);
    })

    it("testSell", async function () {

        let tx = await token2612Contracts.transfer(account1.address, 200);
        await tx.wait();

        tx = await token721Contracts.approve(ntfExchangeContracts.address, tokenId);
        await tx.wait();

        tx = await ntfExchangeContracts.sellNTF(tokenId, 100);
        await tx.wait();

        await token2612Contracts.connect(account1).approve(ntfExchangeContracts.address, 100)

        await ntfExchangeContracts.connect(account1).buyNTF(tokenId, 100);

        await expect(await token721Contracts.ownerOf(tokenId)).to.equal(account1.address);
    })

})
