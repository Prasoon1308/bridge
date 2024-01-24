require("dotenv").config();
const ethers = require("ethers");

const bridgeL1abi = require("../ABI/BridgeL1.json");
const {INFURA_API_KEY} = process.env;
const bridgeL1address = "0xa17B109F1ce02dC9eC2dA710C7B256aaC0E11FfF";
async function main(){
    const provider = new ethers.WebSocketProvider(
        `wss://goerli.infura.io/ws/v3/${INFURA_API_KEY}`);
    const contract = new ethers.Contract(bridgeL1address, bridgeL1abi, provider);
    contract.on("Transfer", (from, to, amount, event) => {
        let info = {
          from: from,
          to: to,
          value: ethers.utils.formatUnits(amount, 18),
          data: event,
        };
        console.log(JSON.stringify(info, null, 4));
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });