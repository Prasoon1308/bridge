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
console.log("BridgeFactory Address on L1:", bridgeFactoryAddress);
console.log("BridgeDeployer Address on L2:", bridgeDeployerAddress);

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

console.log("starting");

const filter1 = bridgeFactory.filters.DepositLog(null, null, null);
const filter2 = bridgeFactory.filters.WithdrawLog(null, null, null);
const filter3 = bridgeDeployer.filters.bridgeDeployedLog(null, null);
const filter4 = bridgeDeployer.filters.mintLog(null, null, null);
const filter5 = bridgeDeployer.filters.burnLog(null, null, null);

// DEPOSIT ON L1 ---> MINT ON L2
try {
  bridgeFactory.on(
    filter1,
    async (rootTokenAddress, fromAddress, amount, event) => {
      console.log(
        "RootToken Address: ",
        rootTokenAddress,
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
      let childTokenAddress = await bridgeDeployer.rootToChild(
        rootTokenAddress
      );
      console.log(
        "ChildToken Address: ",
        childTokenAddress,
        "Minted on L2 to: ",
        fromAddress,
        "Amount: ",
        amount.toNumber()
      );
    }
  );
} catch (error) {
  console.log("Error in Deposit on L1 ---> Mint on L2!");
  console.log(error);
}

// BURN ON L2 ---> WITHDRAW ON L1
try {
  bridgeDeployer.on(
    filter5,
    async (childTokenAddress, fromAddress, amount, event) => {
      console.log(
        "ChildToken Address: ",
        childTokenAddress,
        "Burn on L2 from: ",
        fromAddress,
        "Amount: ",
        amount.toNumber()
      );

      const tx = await bridgeFactory
        .connect(accountX)
        .withdrawOnL1(childTokenAddress, fromAddress, amount.toNumber());
      receipt = await tx.wait();
      console.log(receipt);
      let rootTokenAddress = await bridgeFactory.childToRoot(childTokenAddress);
      console.log(
        "RootToken Address: ",
        rootTokenAddress,
        "Withdrawn on L1 to: ",
        fromAddress,
        "Amount: ",
        amount.toNumber()
      );
    }
  );
} catch (error) {
  console.log("Error in Burn on L2 ---> Withdraw on L1!");
  console.log(error);
}

// NEW BRIDGE DEPLOYED
try {
  bridgeDeployer.on(
    filter3,
    async (rootTokenAddress, childTokenAddress, event) => {
      console.log("New Bridge Deployed on L2");

      const tx = await bridgeFactory
        .connect(accountX)
        .setBridge(rootTokenAddress, childTokenAddress);
      receipt = await tx.wait();
      console.log(receipt);
      console.log("Bridge connected on L1");
      console.log(
        "RootToken Address:",
        rootTokenAddress,
        "ChildToken Address: ",
        childTokenAddress
      );
    }
  );
} catch (error) {
  console.log("Error while connecting bridge on L1!");
  console.log(error);
}
