const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CertificateRegistry...");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = await CertificateRegistry.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ CertificateRegistry deployed at:", address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
