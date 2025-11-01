// ⚠️ IMPORTANTE: Reemplaza estas direcciones con las de TU deployment
// Las obtienes cuando ejecutas: npm run deploy:mumbai

export const CONTRACTS = {
  // Polygon Mumbai Testnet
  CASINO: "0x...",      // Pega aquí la dirección de Casino
  COINFLIP: "0x...",    // Pega aquí la dirección de CoinFlip
  DICE: "0x...",        // Pega aquí la dirección de Dice
  ROULETTE: "0x...",    // Pega aquí la dirección de Roulette
};

export const NETWORK = {
  chainId: 80001, // Polygon Mumbai
  name: "Polygon Mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorer: "https://mumbai.polygonscan.com",
};

// Para cambiar a Polygon Mainnet (dinero real):
// export const NETWORK = {
//   chainId: 137,
//   name: "Polygon Mainnet",
//   rpcUrl: "https://polygon-rpc.com",
//   blockExplorer: "https://polygonscan.com",
// };
