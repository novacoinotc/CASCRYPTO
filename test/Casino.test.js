const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CASCRYPTO Casino", function () {
  // Fixture para desplegar los contratos
  async function deployCasinoFixture() {
    const [owner, treasury, player1, player2] = await ethers.getSigners();

    // Deploy CasinoToken
    const CasinoToken = await ethers.getContractFactory("CasinoToken");
    const token = await CasinoToken.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy Casino con 10 ETH de bankroll
    const initialBankroll = ethers.parseEther("10");
    const minBet = ethers.parseEther("0.01");
    const maxBetPercentage = 100; // 1%
    const houseEdge = 200; // 2%

    const Casino = await ethers.getContractFactory("Casino");
    const casino = await Casino.deploy(
      treasury.address,
      minBet,
      maxBetPercentage,
      houseEdge,
      { value: initialBankroll }
    );
    await casino.waitForDeployment();

    // Deploy CoinFlip
    const CoinFlip = await ethers.getContractFactory("CoinFlip");
    const coinFlip = await CoinFlip.deploy(
      await casino.getAddress(),
      ethers.parseEther("0.01"),
      ethers.parseEther("1"),
      owner.address
    );
    await coinFlip.waitForDeployment();

    // Deploy Dice
    const Dice = await ethers.getContractFactory("Dice");
    const dice = await Dice.deploy(
      await casino.getAddress(),
      ethers.parseEther("0.01"),
      ethers.parseEther("1"),
      owner.address
    );
    await dice.waitForDeployment();

    // Deploy Roulette
    const Roulette = await ethers.getContractFactory("Roulette");
    const roulette = await Roulette.deploy(
      await casino.getAddress(),
      ethers.parseEther("0.01"),
      ethers.parseEther("1"),
      owner.address
    );
    await roulette.waitForDeployment();

    // Authorize games
    await casino.authorizeGame(await coinFlip.getAddress());
    await casino.authorizeGame(await dice.getAddress());
    await casino.authorizeGame(await roulette.getAddress());

    return {
      token,
      casino,
      coinFlip,
      dice,
      roulette,
      owner,
      treasury,
      player1,
      player2,
    };
  }

  describe("CasinoToken", function () {
    it("Should deploy with correct initial supply", async function () {
      const { token, owner } = await loadFixture(deployCasinoFixture);
      const totalSupply = await token.totalSupply();
      const ownerBalance = await token.balanceOf(owner.address);

      expect(totalSupply).to.equal(ethers.parseEther("100000000"));
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should have correct name and symbol", async function () {
      const { token } = await loadFixture(deployCasinoFixture);
      expect(await token.name()).to.equal("Casino Crypto");
      expect(await token.symbol()).to.equal("CASC");
    });
  });

  describe("Casino", function () {
    it("Should initialize with correct bankroll", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      expect(await casino.bankroll()).to.equal(ethers.parseEther("10"));
    });

    it("Should allow adding liquidity", async function () {
      const { casino, player1 } = await loadFixture(deployCasinoFixture);

      const addAmount = ethers.parseEther("5");
      await casino.connect(player1).addLiquidity({ value: addAmount });

      expect(await casino.bankroll()).to.equal(ethers.parseEther("15"));
      expect(await casino.getLiquidityProvided(player1.address)).to.equal(
        addAmount
      );
    });

    it("Should allow removing liquidity", async function () {
      const { casino, player1 } = await loadFixture(deployCasinoFixture);

      const addAmount = ethers.parseEther("5");
      await casino.connect(player1).addLiquidity({ value: addAmount });

      const removeAmount = ethers.parseEther("2");
      await casino.connect(player1).removeLiquidity(removeAmount);

      expect(await casino.getLiquidityProvided(player1.address)).to.equal(
        ethers.parseEther("3")
      );
    });

    it("Should correctly calculate max bet", async function () {
      const { casino } = await loadFixture(deployCasinoFixture);
      const maxBet = await casino.getMaxBet();

      // 1% of 10 ETH = 0.1 ETH
      expect(maxBet).to.equal(ethers.parseEther("0.1"));
    });

    it("Should authorize games", async function () {
      const { casino, coinFlip } = await loadFixture(deployCasinoFixture);
      expect(await casino.isGameAuthorized(await coinFlip.getAddress())).to.be
        .true;
    });
  });

  describe("CoinFlip", function () {
    it("Should place a bet and emit events", async function () {
      const { coinFlip, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.1");
      const tx = await coinFlip
        .connect(player1)
        .placeBet(0, { value: betAmount }); // 0 = HEADS

      await expect(tx).to.emit(coinFlip, "BetPlaced");
      await expect(tx).to.emit(coinFlip, "CoinFlipped");
    });

    it("Should reject bet below minimum", async function () {
      const { coinFlip, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.001"); // Below min
      await expect(
        coinFlip.connect(player1).placeBet(0, { value: betAmount })
      ).to.be.revertedWith("Bet below minimum");
    });

    it("Should calculate correct potential win", async function () {
      const { coinFlip } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("1");
      const potentialWin = await coinFlip.calculatePotentialWin(betAmount);

      // 1.98x multiplier
      expect(potentialWin).to.equal(ethers.parseEther("1.98"));
    });

    it("Should increment bet counter", async function () {
      const { coinFlip, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.1");

      await coinFlip.connect(player1).placeBet(0, { value: betAmount });
      expect(await coinFlip.betIdCounter()).to.equal(1);

      await coinFlip.connect(player1).placeBet(1, { value: betAmount });
      expect(await coinFlip.betIdCounter()).to.equal(2);
    });
  });

  describe("Dice", function () {
    it("Should place a bet with valid number", async function () {
      const { dice, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.1");
      const tx = await dice
        .connect(player1)
        .placeBet(50, { value: betAmount });

      await expect(tx).to.emit(dice, "BetPlaced");
      await expect(tx).to.emit(dice, "DiceRolled");
    });

    it("Should reject invalid number", async function () {
      const { dice, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.1");
      await expect(
        dice.connect(player1).placeBet(0, { value: betAmount })
      ).to.be.revertedWith("Number must be 1-99");

      await expect(
        dice.connect(player1).placeBet(100, { value: betAmount })
      ).to.be.revertedWith("Number must be 1-99");
    });

    it("Should calculate correct multiplier", async function () {
      const { dice } = await loadFixture(deployCasinoFixture);

      // 50% chance should be ~1.96x
      const multiplier50 = await dice.calculateMultiplier(50);
      expect(multiplier50).to.equal(196);

      // 10% chance should be ~9.8x
      const multiplier10 = await dice.calculateMultiplier(10);
      expect(multiplier10).to.equal(980);

      // 90% chance should be ~1.09x
      const multiplier90 = await dice.calculateMultiplier(90);
      expect(multiplier90).to.equal(109);
    });

    it("Should calculate potential win correctly", async function () {
      const { dice } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("1");
      const potentialWin = await dice.calculatePotentialWin(betAmount, 50);

      // 1.96x for 50% chance
      expect(potentialWin).to.equal(ethers.parseEther("1.96"));
    });
  });

  describe("Roulette", function () {
    it("Should place a straight bet", async function () {
      const { roulette, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.01");
      const tx = await roulette
        .connect(player1)
        .placeBet(0, 17, { value: betAmount }); // BetType.STRAIGHT, number 17

      await expect(tx).to.emit(roulette, "BetPlaced");
      await expect(tx).to.emit(roulette, "RouletteSpun");
    });

    it("Should place color bets", async function () {
      const { roulette, player1 } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("0.1");

      // RED bet
      const tx1 = await roulette
        .connect(player1)
        .placeBet(1, 0, { value: betAmount }); // BetType.RED
      await expect(tx1).to.emit(roulette, "RouletteSpun");

      // BLACK bet
      const tx2 = await roulette
        .connect(player1)
        .placeBet(2, 0, { value: betAmount }); // BetType.BLACK
      await expect(tx2).to.emit(roulette, "RouletteSpun");
    });

    it("Should have correct multipliers", async function () {
      const { roulette } = await loadFixture(deployCasinoFixture);

      // Straight: 35:1 = 3500
      expect(await roulette.getMultiplier(0)).to.equal(3500);

      // Red/Black: 1:1 = 200
      expect(await roulette.getMultiplier(1)).to.equal(200);
      expect(await roulette.getMultiplier(2)).to.equal(200);

      // Dozen: 2:1 = 300
      expect(await roulette.getMultiplier(7)).to.equal(300);
    });

    it("Should identify red numbers correctly", async function () {
      const { roulette } = await loadFixture(deployCasinoFixture);

      expect(await roulette.isRedNumber(1)).to.be.true;
      expect(await roulette.isRedNumber(3)).to.be.true;
      expect(await roulette.isRedNumber(5)).to.be.true;

      expect(await roulette.isRedNumber(2)).to.be.false;
      expect(await roulette.isRedNumber(4)).to.be.false;
      expect(await roulette.isRedNumber(0)).to.be.false;
    });

    it("Should calculate potential wins", async function () {
      const { roulette } = await loadFixture(deployCasinoFixture);

      const betAmount = ethers.parseEther("1");

      // Straight bet: 35x
      const straightWin = await roulette.calculatePotentialWin(betAmount, 0);
      expect(straightWin).to.equal(ethers.parseEther("35"));

      // Red/Black: 2x
      const colorWin = await roulette.calculatePotentialWin(betAmount, 1);
      expect(colorWin).to.equal(ethers.parseEther("2"));

      // Dozen: 3x
      const dozenWin = await roulette.calculatePotentialWin(betAmount, 7);
      expect(dozenWin).to.equal(ethers.parseEther("3"));
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple bets from different players", async function () {
      const { coinFlip, player1, player2 } = await loadFixture(
        deployCasinoFixture
      );

      const betAmount = ethers.parseEther("0.1");

      await coinFlip.connect(player1).placeBet(0, { value: betAmount });
      await coinFlip.connect(player2).placeBet(1, { value: betAmount });

      expect(await coinFlip.betIdCounter()).to.equal(2);
    });

    it("Should update casino bankroll on wins and losses", async function () {
      const { casino, dice, player1 } = await loadFixture(
        deployCasinoFixture
      );

      const initialBankroll = await casino.bankroll();
      const betAmount = ethers.parseEther("0.1");

      // Place several bets
      await dice.connect(player1).placeBet(50, { value: betAmount });
      await dice.connect(player1).placeBet(50, { value: betAmount });
      await dice.connect(player1).placeBet(50, { value: betAmount });

      const finalBankroll = await casino.bankroll();

      // Bankroll should have changed (could increase or decrease)
      expect(finalBankroll).to.not.equal(initialBankroll);
    });

    it("Should track profits and losses", async function () {
      const { casino, coinFlip, player1 } = await loadFixture(
        deployCasinoFixture
      );

      const betAmount = ethers.parseEther("0.1");

      // Place multiple bets
      for (let i = 0; i < 5; i++) {
        await coinFlip.connect(player1).placeBet(0, { value: betAmount });
      }

      const totalProfits = await casino.totalProfits();
      const totalLosses = await casino.totalLosses();

      // At least one should be > 0 after 5 bets
      expect(totalProfits + totalLosses).to.be.greaterThan(0);
    });
  });

  describe("Security", function () {
    it("Should prevent unauthorized game access", async function () {
      const { casino, player1 } = await loadFixture(deployCasinoFixture);

      await expect(
        casino.connect(player1).placeBet(player1.address, ethers.parseEther("1"))
      ).to.be.reverted; // No tiene GAME_ROLE
    });

    it("Should prevent non-owner from pausing", async function () {
      const { casino, player1 } = await loadFixture(deployCasinoFixture);

      await expect(casino.connect(player1).pause()).to.be.reverted;
    });

    it("Should prevent bets when paused", async function () {
      const { casino, coinFlip, owner, player1 } = await loadFixture(
        deployCasinoFixture
      );

      // Pause casino
      await casino.connect(owner).pause();

      // Try to bet
      await expect(
        coinFlip
          .connect(player1)
          .placeBet(0, { value: ethers.parseEther("0.1") })
      ).to.be.reverted;
    });
  });
});
