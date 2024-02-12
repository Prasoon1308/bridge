require("dotenv").config();
const config = require("../config/config.json");
const ethers = require("ethers");
const fs = require("fs");
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const bridgeFactoryV3Abi = require("../ABI/BridgeFactoryV3.json");
const bridgeDeployerV3Abi = require("../ABI/BridgeDeployerV3.json");
const tokenL1Abi = require("../ABI/TokenL1.json");
const tokenL2Abi = require("../ABI/TokenL2.json");

const transactionsFile = "../transactions/transactionsL1.json"; 

const bridgeFactoryV3Address = config.BridgeFactoryV3.goerli;
const bridgeDeployerV3Address = config.BridgeDeployerV3.mumbai;
console.log("BridgeFactoryV3 Address on L1:", bridgeFactoryV3Address);
console.log("BridgeDeployerV3 Address on L2:", bridgeDeployerV3Address);

const goerliProvider = new ethers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${INFURA_API_KEY}`
);
const mumbaiProvider = new ethers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
);
const accountX = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(goerliProvider);

const accountY = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(mumbaiProvider);

const bridgeFactoryV3 = new ethers.Contract(
  bridgeFactoryV3Address,
  bridgeFactoryV3Abi,
  goerliProvider
);
const bridgeDeployerV3 = new ethers.Contract(
  bridgeDeployerV3Address,
  bridgeDeployerV3Abi,
  mumbaiProvider
);

console.log("starting");

const filter1 = bridgeFactoryV3.filters.DepositLog; // Deposit on L1
const filter2 = bridgeFactoryV3.filters.WithdrawLog;  // Withdraw on L1
const filter4 = bridgeDeployerV3.filters.mintLog; // Mint on L2
const filter5 = bridgeDeployerV3.filters.burnLog; // Burn on L2

// DEPOSIT ON L1
try {
  bridgeFactoryV3.on(
    filter1,
    (rootTokenAddress, fromAddress, amount, nonce, event) => {
      console.log(
        "RootToken Address: ",
        rootTokenAddress,
        "Deposited on L1 from: ",
        fromAddress,
        "Amount: ",
        amount,
        "Nonce: ",
        nonce
      );
    }
  );
} catch (error) {
  console.log("Error in tracking Deposit on L1!");
  console.log(error);
}


// // BURN ON L2 
try {
  bridgeDeployerV3.on(
    filter5,
    async (childTokenAddress, fromAddress, amount, nonce, event) => {
      console.log(
        "ChildToken Address: ",
        childTokenAddress,
        "Burn on L2 from: ",
        fromAddress,
        "Amount: ",
        amount,
        "Nonce: ",
        nonce
      );

    }
  );
} catch (error) {
  console.log("Error in tracking Burn on L2!");
  console.log(error);
}