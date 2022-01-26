require('dotenv').config()
require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.4',
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/f6PMffGUC3hwSBZEkThTHLkwFlHWdYPd',
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
}
