const { expect } = require("chai");
const { ethers } = require("hardhat/internal/lib/hardhat-lib");
let counter;

describe("Counter", function (){
    async function init() {
        const Counter = await ethers.getContractFactory("Counter");
        counter= await Counter.deploy();
        await counter.deployed();
        console.log("counter:" + counter.address);   
    }

    before(async function(){
        await init();
    })

    it("self call", async function (){
        let tx= await counter.add(1);
        tx.wait();
        expect(await counter.counter()).to.equal(1);
    })

    it("other call",async function (){
        const [owner,otherAccount] = await ethers.getSigners();
        
        let add= counter.connect(otherAccount).add(1);

       await expect(add).eventually.to.rejectedWith(Error,"this function is restricted to the owner")
    })
})
