# 🚀 Guía de Inicio Rápido - CASCRYPTO

Esta guía te llevará de cero a un casino funcionando en **15 minutos**.

## ✅ Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- Git
- Wallet con criptomonedas (MetaMask recomendado)

## 📦 Paso 1: Instalación

```bash
# Clonar el repositorio
git clone https://github.com/novacoinotc/CASCRYPTO.git
cd CASCRYPTO

# Instalar dependencias
npm install
```

## ⚙️ Paso 2: Configuración

```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tu editor favorito
nano .env  # o vim, code, etc.
```

### Configurar .env

```bash
# IMPORTANTE: Agrega tu private key
PRIVATE_KEY=tu_private_key_aqui

# Para testnet, puedes usar los RPC públicos
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Los API keys son opcionales para testnet
POLYGONSCAN_API_KEY=opcional
```

### 🔑 Obtener Private Key de MetaMask

1. Abre MetaMask
2. Click en los 3 puntos → Account details
3. Click "Export Private Key"
4. Ingresa tu password
5. **⚠️ NUNCA compartas esta key con nadie**
6. Cópiala al archivo .env

### 💰 Obtener Fondos de Testnet

Para Polygon Mumbai:
1. Ve a https://faucet.polygon.technology/
2. Conecta tu wallet
3. Solicita MATIC gratis
4. Espera 1-2 minutos

## 🔨 Paso 3: Compilar Contratos

```bash
npm run compile
```

Deberías ver:
```
Compiled 15 Solidity files successfully
```

## 🧪 Paso 4: Ejecutar Tests

```bash
npm run test
```

Todos los tests deberían pasar:
```
  CASCRYPTO Casino
    CasinoToken
      ✓ Should deploy with correct initial supply
      ✓ Should have correct name and symbol
    Casino
      ✓ Should initialize with correct bankroll
      ✓ Should allow adding liquidity
      ...
  55 passing (3s)
```

## 🚀 Paso 5: Desplegar en Testnet

### Opción A: Red Local (Desarrollo)

Terminal 1:
```bash
npm run node
```

Terminal 2:
```bash
npm run deploy:local
```

### Opción B: Polygon Mumbai (Testnet público)

```bash
npm run deploy:mumbai
```

Deberías ver:
```
🎰 Deploying CASCRYPTO Casino...

Deploying contracts with account: 0x...
Account balance: 5.0 ETH

📋 Deployment Configuration:
  Treasury: 0x...
  Min Bet: 0.01 ETH
  Max Bet %: 1 %
  House Edge: 2 %
  Initial Bankroll: 10 ETH

📝 Deploying CasinoToken...
✅ CasinoToken deployed to: 0x...

🏛️  Deploying Casino...
✅ Casino deployed to: 0x...

🪙 Deploying CoinFlip...
✅ CoinFlip deployed to: 0x...

🎲 Deploying Dice...
✅ Dice deployed to: 0x...

🎡 Deploying Roulette...
✅ Roulette deployed to: 0x...

🔐 Authorizing games in Casino...
✅ CoinFlip authorized
✅ Dice authorized
✅ Roulette authorized

═══════════════════════════════════════════════════════
🎉 DEPLOYMENT COMPLETE! 🎉
═══════════════════════════════════════════════════════

📋 Contract Addresses:
  CasinoToken: 0x...
  Casino:      0x...
  CoinFlip:    0x...
  Dice:        0x...
  Roulette:    0x...
```

**⚠️ GUARDA ESTAS DIRECCIONES** - Las necesitarás para el frontend.

## 🎮 Paso 6: Probar el Casino

### Usando Hardhat Console

```bash
npx hardhat console --network mumbai
```

```javascript
// Cargar contratos
const Casino = await ethers.getContractFactory("Casino");
const casino = await Casino.attach("0x_DIRECCION_DEL_CASINO");

const CoinFlip = await ethers.getContractFactory("CoinFlip");
const coinFlip = await CoinFlip.attach("0x_DIRECCION_DEL_COINFLIP");

// Ver bankroll
const bankroll = await casino.bankroll();
console.log("Bankroll:", ethers.formatEther(bankroll), "ETH");

// Realizar una apuesta
const tx = await coinFlip.placeBet(0, { // 0 = HEADS
  value: ethers.parseEther("0.1")
});
await tx.wait();

console.log("Bet placed! Check the events...");

// Ver resultado
const betId = 0; // Primera apuesta
const bet = await coinFlip.getBet(betId);
console.log("Bet result:", bet);
```

### Usando Script

Crear `scripts/play.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  const coinFlipAddress = "0x_TU_COINFLIP_ADDRESS";
  const CoinFlip = await ethers.getContractFactory("CoinFlip");
  const coinFlip = await CoinFlip.attach(coinFlipAddress);

  console.log("Placing bet...");

  const tx = await coinFlip.placeBet(0, { // HEADS
    value: ethers.parseEther("0.05")
  });

  const receipt = await tx.wait();

  // Encontrar evento BetSettled
  const event = receipt.logs.find(log => {
    try {
      return coinFlip.interface.parseLog(log).name === "BetSettled";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = coinFlip.interface.parseLog(event);
    console.log("\n🎲 Result:");
    console.log("  Won:", parsed.args.won);
    console.log("  Payout:", ethers.formatEther(parsed.args.payout), "ETH");
  }
}

main();
```

Ejecutar:
```bash
npx hardhat run scripts/play.js --network mumbai
```

## 🌐 Paso 7: Verificar Contratos (Opcional)

Para verificar en PolygonScan:

1. Obtén un API key de https://polygonscan.com/apis
2. Agrégalo a `.env`:
   ```
   POLYGONSCAN_API_KEY=tu_api_key
   ```

3. Verifica:
   ```bash
   npx hardhat verify --network mumbai 0x_DIRECCION_DEL_CONTRATO "arg1" "arg2"
   ```

## 📊 Ver en Block Explorer

### Polygon Mumbai
- PolygonScan: https://mumbai.polygonscan.com/address/TU_DIRECCION

Aquí puedes:
- ✅ Ver todas las transacciones
- ✅ Llamar funciones de lectura
- ✅ Ver eventos emitidos
- ✅ Verificar el código fuente

## 🎯 Próximos Pasos

### 1. Jugar más juegos

```javascript
// Dice
const dice = await Dice.attach("0x_DICE_ADDRESS");
await dice.placeBet(50, { // 50% probabilidad
  value: ethers.parseEther("0.1")
});

// Roulette
const roulette = await Roulette.attach("0x_ROULETTE_ADDRESS");
await roulette.placeBet(1, 0, { // BetType.RED
  value: ethers.parseEther("0.05")
});
```

### 2. Añadir Liquidez

```javascript
await casino.addLiquidity({
  value: ethers.parseEther("5")
});
```

### 3. Integrar Frontend

Ver `/frontend/README.md` para instrucciones de desarrollo del frontend.

### 4. Implementar Chainlink VRF

Para producción, **debes** usar Chainlink VRF. Ver `docs/CHAINLINK_VRF.md`.

## 🆘 Solución de Problemas

### Error: "insufficient funds"
- Asegúrate de tener suficiente MATIC en tu wallet
- Usa el faucet: https://faucet.polygon.technology/

### Error: "nonce too high"
- Resetea la cuenta en MetaMask: Settings → Advanced → Reset Account

### Error: "transaction underpriced"
- Aumenta el gas price en `hardhat.config.js`

### Compilación falla
```bash
npm run clean
npm install
npm run compile
```

### Tests fallan
- Verifica que tienes suficiente ETH en la red local
- Reinicia el nodo: `npm run node`

## 📚 Recursos Adicionales

- **Arquitectura**: Ver `ARCHITECTURE.md`
- **Chainlink VRF**: Ver `docs/CHAINLINK_VRF.md`
- **Documentación Hardhat**: https://hardhat.org/docs
- **Polygon Docs**: https://docs.polygon.technology/

## 🎉 ¡Felicidades!

Has desplegado exitosamente un casino descentralizado en Web3. Ahora puedes:

- ✅ Experimentar con los juegos
- ✅ Modificar parámetros (house edge, limits, etc.)
- ✅ Añadir nuevos juegos
- ✅ Desarrollar el frontend
- ✅ Preparar para mainnet

---

**¿Preguntas?** Abre un issue en GitHub o únete a nuestro Discord.

**⚠️ Disclaimer**: Este es un proyecto educativo. Verifica las leyes locales sobre gambling antes de lanzar en producción.
