require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 20, // Số lượng tài khoản test
        initialBalance: "10000000000000000000000", // 10000 ETH (trong wei)
      },
    },
  },
};