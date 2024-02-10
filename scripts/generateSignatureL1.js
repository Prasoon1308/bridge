const { ethers } = require("ethers");
require("dotenv").config();
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const domain = {
  name: "BridgeFactoryV3",
  version: "3",
  chainId: 5,
  verifyingContract: "0xf4a4c4171a73e50bb2C3a0267849A31D6c9f1814", // BridgeFactory address on L1
};

const types = {
  WithdrawOnL1: [
    { name: "childToken", type: "address" },
    { name: "userAddress", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "transactionNonce", type: "uint256" },
  ],
};

const value = {
  childToken: "0x83f1E8ef30CCdCf4Aaa562CBDEa32972Ec63DEDD", // TokenL2 address on L2
  userAddress: "0x87B940e50c82b5498896ba43003Bf8cA26f717FB", // User address
  amount: 10,
  transactionNonce: 2,
};

async function signAndData() {
  const goerliProvider = new ethers.JsonRpcProvider(
    `https://goerli.infura.io/v3/${INFURA_API_KEY}`
  );
  const mumbaiProvider = new ethers.JsonRpcProvider(
    `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`
  );
  const accountX = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(
    goerliProvider
  );

  const accountY = new ethers.Wallet(`0x${PRIVATE_KEY}`).connect(
    mumbaiProvider
  );

  try {
    console.log("wallet---", accountX.address);
    const MINT_TYPEHASH = await ethers.keccak256(
      ethers.solidityPacked(
        ["string"],
        ["WithdrawOnL1(address childToken,address userAddress,uint256 amount,uint256 transactionNonce)"]
      )
    );
    console.log("MINT_TYPEHASH---------:", MINT_TYPEHASH);

    const abiCoder = new ethers.AbiCoder();
    const data = await abiCoder.encode(
      ["bytes32", "address", "address", "uint256", "uint256"],
      [MINT_TYPEHASH, value.childToken, value.userAddress, value.amount, value.transactionNonce]
    );
    console.log("data---------:", data);
    const dataHash = await ethers.keccak256(data);
    console.log("structHash---------:", dataHash);

    const signature = await accountX.signTypedData(domain, types, value);
    console.log("signature---------:", signature);
  } catch (error) {
    console.log("error-----:", error);
  }
}
signAndData();
