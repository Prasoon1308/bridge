require("dotenv").config();
const config = require("../config/config.json");
const ethers = require("ethers");
const cron = require("node-cron");
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const bridgeFactoryAbi = require("../ABI/BridgeFactory.json");
const bridgeDeployerAbi = require("../ABI/BridgeDeployer.json");
const tokenL1Abi = require("../ABI/TokenL1.json");
const tokenL2Abi = require("../ABI/TokenL2.json");

const bridgeFactoryAddress = config.BridgeFactory.goerli;
const bridgeDeployerAddress = config.BridgeDeployer.mumbai;
const rootTokenAddress = config.TL1.goerli;
const childTokenAddress = config.TL1.mumbai;
console.log(bridgeFactoryAddress);
console.log(bridgeDeployerAddress);
console.log(rootTokenAddress);
console.log(childTokenAddress);

const goerliProvider = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${INFURA_API_KEY}`
);
const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
);
const accountX = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(goerliProvider);

const accountY = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(mumbaiProvider);

const bridgeFactory = new ethers.Contract(
  bridgeFactoryAddress,
  bridgeFactoryAbi,
  goerliProvider
);
const bridgeDeployer = new ethers.Contract(
  bridgeDeployerAddress,
  bridgeDeployerAbi,
  mumbaiProvider
);
const childToken = new ethers.Contract(
  childTokenAddress,
  tokenL2Abi,
  mumbaiProvider
);
const rootToken = new ethers.Contract(
  rootTokenAddress,
  tokenL1Abi,
  goerliProvider
);

console.log("starting");

const filter1 = bridgeFactory.filters.DepositLog(null, null, null);
const filter2 = bridgeFactory.filters.WithdrawLog(null, null, null);
const filter3 = bridgeDeployer.filters.bridgeDeployedLog(null, null);
const filter4 = bridgeDeployer.filters.mintLog(null, null, null);
const filter5 = bridgeDeployer.filters.burnLog(null, null, null);

// DEPOSIT ON L1 ---> MINT ON L2
cron.schedule("* * * * *", async function () {
  try {
    bridgeFactory.on(
      filter1,
      async (tokenAddress, fromAddress, amount, event) => {
        console.log(
          "RootToken Address: ",
          tokenAddress,
          "Deposited on L1 from: ",
          fromAddress,
          "Amount: ",
          amount.toNumber()
        );

        const tx = await bridgeDeployer
          .connect(accountY)
          .mintOnL2(rootTokenAddress, fromAddress, amount.toNumber());
        receipt = await tx.wait();
        console.log(receipt);
      }
    );
  } catch (error) {
    console.log(error);
  }
});
// BURN ON L2 ---> WITHDRAW ON L1
cron.schedule("* * * * *", async function () {
  try {
    bridgeDeployer.on(
      filter5,
      async (tokenAddress, fromAddress, amount, event) => {
        console.log(
          "ChildToken Address: ",
          tokenAddress,
          "Burn on L2 from: ",
          fromAddress,
          "Amount: ",
          amount.toNumber()
        );

        const tx = await bridgeFactory
          .connect(accountX)
          .withdrawOnL1(tokenAddress, fromAddress, amount.toNumber());
        receipt = await tx.wait();
        console.log(receipt);
      }
    );
  } catch (error) {
    console.log(error);
  }
});
