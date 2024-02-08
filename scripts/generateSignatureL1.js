const { ethers } = require("ethers");
const { AbiCoder } = require("ethers/lib/utils");
require("dotenv").config();
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const domain = {
  name: "BridgeFactoryV3",
  version: "1",
  chainId: 5,
  verifyingContract: "0x89b783cd4D678d91212631941229122e7eba38bE", // BridgeFactory address on L1
};

const types = {
  WithdrawOnL1: [
    { name: "childToken", type: "address" },
    { name: "userAddress", type: "address" },
    { name: "amount", type: "uint256" },
  ],
};

const value = {
  childToken: "0x0a7d598926a5F891Cb6273dC0AD28748912E9E79", // TokenL2 address on L2
  userAddress: "0x87B940e50c82b5498896ba43003Bf8cA26f717FB", // User address
  amount: 10,
};

async function signAndData() {
  const goerliProvider = new ethers.providers.JsonRpcProvider(
    `https://goerli.infura.io/v3/${INFURA_API_KEY}`
  );
  const mumbaiProvider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
  );
  const accountX = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(goerliProvider);
  
  const accountY = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(mumbaiProvider);
  console.log(accountY.address)
  
  try {
    console.log("wallet---",accountY.address);
    const MINT_TYPEHASH = await ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["string"],
        ["MintOnL2(address rootToken,address userAddress,uint256 amount)"]
      )
    );
    console.log("MINT_TYPEHASH---------:", MINT_TYPEHASH);

    const abiCoder = new ethers.utils.AbiCoder();
    const data = await abiCoder.encode(
      ["bytes32", "address", "address", "uint256"],
      [MINT_TYPEHASH, value.childToken, value.userAddress, value.amount]
    );
    console.log("data---------:", data);
    const dataHash = await ethers.utils.keccak256(data);
    console.log("structHash---------:", dataHash);

    const signature = await accountX._signTypedData(domain, types, value);
    console.log("signature---------:", signature);
  } catch (error) {
    console.log("error-----:", error);
  }
}
signAndData();
