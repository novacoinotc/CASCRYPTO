// ABIs simplificados de los contratos
// Solo incluyen las funciones que el frontend necesita

export const COINFLIP_ABI = [
  "function placeBet(uint8 choice) payable returns (uint256)",
  "function getBet(uint256 betId) view returns (address player, uint256 amount, uint8 choice, uint8 result, uint256 timestamp, bool settled)",
  "function calculatePotentialWin(uint256 amount) view returns (uint256)",
  "function getGameStats() view returns (uint256 totalBets, uint256 currentMinBet, uint256 currentMaxBet, uint256 currentHouseEdge, uint256 multiplier)",
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function betIdCounter() view returns (uint256)",
  "event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, uint256 timestamp)",
  "event CoinFlipped(uint256 indexed betId, address indexed player, uint8 choice, uint8 result, bool won, uint256 payout)",
  "event BetSettled(uint256 indexed betId, address indexed player, bool won, uint256 payout, uint256 result)"
];

export const DICE_ABI = [
  "function placeBet(uint8 numberChosen) payable returns (uint256)",
  "function getBet(uint256 betId) view returns (address player, uint256 amount, uint8 numberChosen, uint8 resultNumber, uint256 multiplier, uint256 timestamp, bool settled)",
  "function calculatePotentialWin(uint256 amount, uint8 numberChosen) view returns (uint256)",
  "function calculateMultiplier(uint8 numberChosen) view returns (uint256)",
  "function getGameStats() view returns (uint256 totalBets, uint256 currentMinBet, uint256 currentMaxBet, uint256 currentHouseEdge)",
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function betIdCounter() view returns (uint256)",
  "event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, uint256 timestamp)",
  "event DiceRolled(uint256 indexed betId, address indexed player, uint8 numberChosen, uint8 resultNumber, bool won, uint256 payout, uint256 multiplier)",
  "event BetSettled(uint256 indexed betId, address indexed player, bool won, uint256 payout, uint256 result)"
];

export const ROULETTE_ABI = [
  "function placeBet(uint8 betType, uint8 value) payable returns (uint256)",
  "function getBet(uint256 betId) view returns (address player, uint256 amount, uint8 betType, uint8 value, uint8 resultNumber, uint256 multiplier, uint256 timestamp, bool settled)",
  "function calculatePotentialWin(uint256 amount, uint8 betType) view returns (uint256)",
  "function getMultiplier(uint8 betType) view returns (uint256)",
  "function isRedNumber(uint8 number) view returns (bool)",
  "function getGameStats() view returns (uint256 totalBets, uint256 currentMinBet, uint256 currentMaxBet, uint256 currentHouseEdge)",
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function betIdCounter() view returns (uint256)",
  "event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, uint256 timestamp)",
  "event RouletteSpun(uint256 indexed betId, address indexed player, uint8 betType, uint8 value, uint8 resultNumber, bool won, uint256 payout, uint256 multiplier)",
  "event BetSettled(uint256 indexed betId, address indexed player, bool won, uint256 payout, uint256 result)"
];

export const CASINO_ABI = [
  "function bankroll() view returns (uint256)",
  "function minBet() view returns (uint256)",
  "function maxBetPercentage() view returns (uint256)",
  "function houseEdge() view returns (uint256)",
  "function totalProfits() view returns (uint256)",
  "function totalLosses() view returns (uint256)",
  "function getMaxBet() view returns (uint256)",
  "function getBalance() view returns (uint256)",
  "function addLiquidity() payable",
  "function removeLiquidity(uint256 amount)",
  "function getLiquidityProvided(address provider) view returns (uint256)"
];
