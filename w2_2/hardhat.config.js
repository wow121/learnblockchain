require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const { ProxyAgent, setGlobalDispatcher } = require("undici")

const proxyAgent = new ProxyAgent("http://127.0.0.1:10809")
setGlobalDispatcher(proxyAgent)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    goerli:{
      url:'https://eth-goerli.api.onfinality.io/public',
      chainId:5,
      accounts:[process.env.privateKey]
    }
  },
  etherscan:{
    apiKey:{
      goerli:process.env.ethscanApiKey
    }
  }
};

