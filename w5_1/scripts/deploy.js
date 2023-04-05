// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    const TokenERC20Permit = await hre.ethers.getContractFactory("TokenERC20Permit")
    const tokenERC20Permit = await TokenERC20Permit.deploy();
    //
    await tokenERC20Permit.deployed();

    console.log("token deployed finish address " + tokenERC20Permit.address)

    const Vault = await hre.ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(tokenERC20Permit.address);

    await vault.deployed();
    console.log("vault deployed finish address " + vault.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
