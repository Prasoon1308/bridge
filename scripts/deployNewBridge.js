require("dotenv").config();
const config = require("../config/config.json");
const ethers = require("ethers");
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const bridgeFactoryV3Abi = require("../ABI/BridgeFactoryV3.json");
const bridgeDeployerV3Abi = require("../ABI/BridgeDeployerV3.json");
const tokenL1Abi = require("../ABI/TokenL1.json");
const tokenL2Abi = require("../ABI/TokenL2.json");

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

const filter3 = bridgeDeployerV3.filters.bridgeDeployedLog();

// NEW BRIDGE DEPLOYED
try {
    bridgeDeployerV3.on(
    filter3,
    async (rootTokenAddress, childTokenAddress, event) => {
      console.log("New Bridge Deployed on L2");

      const tx = await bridgeFactoryV3
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
