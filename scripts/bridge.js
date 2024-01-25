require("dotenv").config();
const ethers = require("ethers");
const cron = require("node-cron");
const bridgeL1abi = require("../ABI/BridgeL1.json");
const bridgeL2abi = require("../ABI/BridgeL2.json");
const { INFURA_API_KEY,  PRIVATE_KEY} = process.env;
const bridgeL1address = "0x92f3a7DC443996D3eA8E517F80c09F94B819bc68";
const bridgeL2address = "0x0b41EE19DFaF49D76E1Dc52F76a8E6b36492b82b";

const goerliProvider = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${INFURA_API_KEY}`
);
const mumbaiProvider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
);
const accountX = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(
    goerliProvider
  );
  
  const accountY = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(
    mumbaiProvider
  );

const bridgeL1 = new ethers.Contract(bridgeL1address, bridgeL1abi, goerliProvider);
const bridgeL2 = new ethers.Contract(bridgeL2address, bridgeL2abi, mumbaiProvider);

console.log("start");
const filter1 = bridgeL1.filters.DepositLog(null, bridgeL1address, null);
const filter2 = bridgeL1.filters.WithdrawLog(null, bridgeL1address, null);
cron.schedule("* * * * * *", async function () {
  try {
    bridgeL1.on(filter1, async(_from, _to, _amount, event) => {
      console.log(`${_from} => ${_to}: ${_amount}`);

      const tx = await bridgeL2.connect(accountY).mint(_from, _amount);
      receipt = await tx.wait();
      console.log(receipt);
    });
  } catch (error) {}
});
cron.schedule("* * * * * *", async function () {
  try {
    bridgeL1.on(filter2, async(_from, _to, _amount, event) => {
      console.log(`${_from} => ${_to}: ${_amount}`);

      const tx = await bridgeL2.connect(accountY).burn(_from, _amount);
      receipt = await tx.wait();
      console.log(receipt);
    });
  } catch (error) {}
});

