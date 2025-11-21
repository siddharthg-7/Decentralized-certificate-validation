const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying CertificateRegistry contract...");

    // Get the contract factory
    const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");

    // Deploy the contract
    const certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();

    const contractAddress = await certificateRegistry.getAddress();

    console.log("✅ CertificateRegistry deployed to:", contractAddress);

    // Get deployer address
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deployed by:", deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

    // Save deployment information
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deploymentTime: new Date().toISOString(),
        blockNumber: await hre.ethers.provider.getBlockNumber()
    };

    // Save contract address and deployment info
    fs.writeFileSync(
        path.join(deploymentsDir, "CertificateRegistry.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Save contract ABI
    const artifact = await hre.artifacts.readArtifact("CertificateRegistry");
    fs.writeFileSync(
        path.join(deploymentsDir, "CertificateRegistry-ABI.json"),
        JSON.stringify(artifact.abi, null, 2)
    );

    console.log("💾 Deployment info saved to deployments/CertificateRegistry.json");
    console.log("📄 Contract ABI saved to deployments/CertificateRegistry-ABI.json");

    // Verify deployer is authorized issuer
    const isAuthorized = await certificateRegistry.isAuthorizedIssuer(deployer.address);
    console.log("🔐 Deployer authorized as issuer:", isAuthorized);

    console.log("\n✨ Deployment complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Copy the contract address to your .env file");
    console.log("2. Update backend configuration with the contract address");
    console.log("3. Start the backend server: cd backend && npm run dev");
    console.log("4. Start the frontend: cd frontend && npm start");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
