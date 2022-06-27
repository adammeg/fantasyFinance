require("@nomiclabs/hardhat-waffle");
const ALCHEMY_API_KEY ="";
const RENKEBY_PRIVATE_KEY ="";
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks :{
    renkeby :{
      url : `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${RENKEBY_PRIVATE_KEY}`]
    }
  }
};
