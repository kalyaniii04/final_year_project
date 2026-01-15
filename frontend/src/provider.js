import { JsonRpcProvider } from "ethers";

// Primary RPC
const provider = new JsonRpcProvider(
  "https://sepolia.infura.io/v3/30650fddcd9c4ae5845345d25dd4967e"
);

export default provider;


async function testProvider() {
  try {
    const block = await fallbackProvider.getBlockNumber();
    console.log("✅ Connected! Current Sepolia block:", block);
  } catch (err) {
    console.error("❌ RPC connection failed:", err);
  }
}

testProvider();
