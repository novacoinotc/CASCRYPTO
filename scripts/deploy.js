const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎰 Deploying CASCRYPTO Casino...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ========== DEPLOYMENT CONFIGURATION ==========

  const config = {
    // Casino Token
    tokenName: "Casino Crypto",
    tokenSymbol: "CASC",
    totalSupply: ethers.parseEther("100000000"), // 100 million

    // Casino
    treasury: deployer.address, // En producción usar una multisig
    minBet: ethers.parseEther("0.01"), // 0.01 ETH
    maxBetPercentage: 100, // 1% del bankroll
    houseEdge: 200, // 2%
    initialBankroll: ethers.parseEther("10"), // 10 ETH inicial

    // Games
    coinFlipMinBet: ethers.parseEther("0.01"),
    coinFlipMaxBet: ethers.parseEther("1"),

    diceMinBet: ethers.parseEther("0.01"),
    diceMaxBet: ethers.parseEther("1"),

    rouletteMinBet: ethers.parseEther("0.01"),
    rouletteMaxBet: ethers.parseEther("1"),
  };

  console.log("📋 Deployment Configuration:");
  console.log("  Treasury:", config.treasury);
  console.log("  Min Bet:", ethers.formatEther(config.minBet), "ETH");
  console.log("  Max Bet %:", config.maxBetPercentage / 100, "%");
  console.log("  House Edge:", config.houseEdge / 100, "%");
  console.log("  Initial Bankroll:", ethers.formatEther(config.initialBankroll), "ETH\n");

  // ========== DEPLOY CASINO TOKEN ==========

  console.log("📝 Deploying CasinoToken...");
  const CasinoToken = await ethers.getContractFactory("CasinoToken");
  const token = await CasinoToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ CasinoToken deployed to:", tokenAddress);
  console.log("   Total Supply:", ethers.formatEther(await token.totalSupply()), "CASC\n");

  // ========== DEPLOY CASINO ==========

  console.log("🏛️  Deploying Casino...");
  const Casino = await ethers.getContractFactory("Casino");
  const casino = await Casino.deploy(
    config.treasury,
    config.minBet,
    config.maxBetPercentage,
    config.houseEdge,
    { value: config.initialBankroll }
  );
  await casino.waitForDeployment();
  const casinoAddress = await casino.getAddress();
  console.log("✅ Casino deployed to:", casinoAddress);
  console.log("   Bankroll:", ethers.formatEther(await casino.bankroll()), "ETH\n");

  // ========== DEPLOY COIN FLIP ==========

  console.log("🪙 Deploying CoinFlip...");
  const CoinFlip = await ethers.getContractFactory("CoinFlip");
  const coinFlip = await CoinFlip.deploy(
    casinoAddress,
    config.coinFlipMinBet,
    config.coinFlipMaxBet,
    deployer.address
  );
  await coinFlip.waitForDeployment();
  const coinFlipAddress = await coinFlip.getAddress();
  console.log("✅ CoinFlip deployed to:", coinFlipAddress, "\n");

  // ========== DEPLOY DICE ==========

  console.log("🎲 Deploying Dice...");
  const Dice = await ethers.getContractFactory("Dice");
  const dice = await Dice.deploy(
    casinoAddress,
    config.diceMinBet,
    config.diceMaxBet,
    deployer.address
  );
  await dice.waitForDeployment();
  const diceAddress = await dice.getAddress();
  console.log("✅ Dice deployed to:", diceAddress, "\n");

  // ========== DEPLOY ROULETTE ==========

  console.log("🎡 Deploying Roulette...");
  const Roulette = await ethers.getContractFactory("Roulette");
  const roulette = await Roulette.deploy(
    casinoAddress,
    config.rouletteMinBet,
    config.rouletteMaxBet,
    deployer.address
  );
  await roulette.waitForDeployment();
  const rouletteAddress = await roulette.getAddress();
  console.log("✅ Roulette deployed to:", rouletteAddress, "\n");

  // ========== AUTHORIZE GAMES ==========

  console.log("🔐 Authorizing games in Casino...");

  let tx = await casino.authorizeGame(coinFlipAddress);
  await tx.wait();
  console.log("✅ CoinFlip authorized");

  tx = await casino.authorizeGame(diceAddress);
  await tx.wait();
  console.log("✅ Dice authorized");

  tx = await casino.authorizeGame(rouletteAddress);
  await tx.wait();
  console.log("✅ Roulette authorized\n");

  // ========== SAVE DEPLOYMENT INFO ==========

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CasinoToken: {
        address: tokenAddress,
        totalSupply: ethers.formatEther(await token.totalSupply()),
      },
      Casino: {
        address: casinoAddress,
        bankroll: ethers.formatEther(await casino.bankroll()),
        minBet: ethers.formatEther(await casino.minBet()),
        maxBetPercentage: (await casino.maxBetPercentage()).toString(),
        houseEdge: (await casino.houseEdge()).toString(),
      },
      CoinFlip: {
        address: coinFlipAddress,
        minBet: ethers.formatEther(await coinFlip.minBet()),
        maxBet: ethers.formatEther(await coinFlip.maxBet()),
      },
      Dice: {
        address: diceAddress,
        minBet: ethers.formatEther(await dice.minBet()),
        maxBet: ethers.formatEther(await dice.maxBet()),
      },
      Roulette: {
        address: rouletteAddress,
        minBet: ethers.formatEther(await roulette.minBet()),
        maxBet: ethers.formatEther(await roulette.maxBet()),
      },
    },
  };

  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentDir,
    `deployment-${deploymentInfo.network}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment info saved to:", deploymentFile, "\n");

  // ========== SUMMARY ==========

  console.log("═══════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE! 🎉");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log("📋 Contract Addresses:");
  console.log("  CasinoToken:", tokenAddress);
  console.log("  Casino:     ", casinoAddress);
  console.log("  CoinFlip:   ", coinFlipAddress);
  console.log("  Dice:       ", diceAddress);
  console.log("  Roulette:   ", rouletteAddress, "\n");
  console.log("🎮 Next Steps:");
  console.log("  1. Verify contracts on block explorer");
  console.log("  2. Add liquidity to the casino");
  console.log("  3. Test games with small bets");
  console.log("  4. Update frontend with new addresses");
  console.log("  5. Run security audit before mainnet\n");
  console.log("═══════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
