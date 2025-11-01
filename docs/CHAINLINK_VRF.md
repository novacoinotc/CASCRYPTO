# 🔗 Integración de Chainlink VRF

## ⚠️ IMPORTANTE: Randomness en Blockchain

Los contratos actuales usan un método **pseudo-aleatorio** que **NO es seguro** para producción:

```solidity
// ❌ NO USAR EN PRODUCCIÓN
function _generateRandomNumber(uint256 seed, uint256 max) internal view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        msg.sender,
        seed,
        betIdCounter
    ))) % max;
}
```

**Problemas:**
- Los mineros pueden manipular `block.timestamp` y `block.prevrandao`
- Predecible si conoces los valores de entrada
- No es verdaderamente aleatorio

## ✅ Solución: Chainlink VRF (Verifiable Random Function)

Chainlink VRF proporciona números verdaderamente aleatorios y verificables on-chain.

### ¿Cómo funciona?

1. Tu contrato solicita un número aleatorio a Chainlink
2. Chainlink genera el número off-chain con criptografía segura
3. Chainlink envía el número + prueba criptográfica a tu contrato
4. Tu contrato verifica la prueba y usa el número

### Ventajas

- ✅ **Provably Fair**: Verificable on-chain
- ✅ **Imposible de manipular**: Ni mineros ni operadores pueden alterarlo
- ✅ **Auditable**: Toda la cadena de generación es pública
- ✅ **Estándar de la industria**: Usado por los mejores protocolos DeFi

### Costos

- **Testnet (Mumbai/Sepolia)**: GRATIS (usa LINK de faucet)
- **Mainnet**: ~0.25 LINK por request (~$0.50 USD)

## 📋 Guía de Implementación

### Paso 1: Obtener LINK Tokens

#### Testnet (Polygon Mumbai)
1. Visita el faucet: https://faucets.chain.link/mumbai
2. Conecta tu wallet
3. Solicita LINK tokens (gratis)

#### Mainnet (Polygon)
1. Compra LINK en un exchange (Binance, Coinbase, etc.)
2. Envía a tu wallet
3. Necesitarás ~10 LINK para empezar

### Paso 2: Crear Subscription

1. Ve a https://vrf.chain.link
2. Conecta tu wallet
3. Click "Create Subscription"
4. Añade fondos (LINK tokens)
5. Guarda tu **Subscription ID**

### Paso 3: Actualizar Contratos

Ejemplo de implementación para el juego CoinFlip:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../BaseGame.sol";

/**
 * @title CoinFlipVRF
 * @dev CoinFlip con Chainlink VRF para randomness verificable
 */
contract CoinFlipVRF is BaseGame, VRFConsumerBaseV2 {

    // ========== VRF CONFIG ==========

    VRFCoordinatorV2Interface COORDINATOR;

    uint64 immutable subscriptionId;
    bytes32 immutable keyHash;
    uint32 callbackGasLimit = 200000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // ========== ENUMS ==========

    enum Side { HEADS, TAILS }

    // ========== STRUCTS ==========

    struct Bet {
        address player;
        uint256 amount;
        Side choice;
        bool settled;
    }

    // ========== STATE VARIABLES ==========

    mapping(uint256 => Bet) public bets;
    mapping(uint256 => uint256) public requestIdToBetId;

    // ========== CONSTRUCTOR ==========

    /**
     * @param _casino Casino address
     * @param _minBet Min bet
     * @param _maxBet Max bet
     * @param _vrfCoordinator Chainlink VRF Coordinator address
     * @param _keyHash Gas lane key hash
     * @param _subscriptionId VRF subscription ID
     */
    constructor(
        address _casino,
        uint256 _minBet,
        uint256 _maxBet,
        address initialOwner,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    )
        BaseGame(_casino, 200, _minBet, _maxBet, initialOwner)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @dev Realizar apuesta - ahora ASÍNCRONA
     */
    function placeBet(Side choice)
        external
        payable
        nonReentrant
        whenNotPaused
        validBet(msg.value)
        returns (uint256 betId)
    {
        // Validar apuesta
        _placeBet(msg.sender, msg.value);

        // Crear ID de apuesta
        betId = betIdCounter++;

        // Solicitar número aleatorio a Chainlink
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        // Guardar apuesta PENDIENTE
        bets[betId] = Bet({
            player: msg.sender,
            amount: msg.value,
            choice: choice,
            settled: false
        });

        // Mapear requestId -> betId
        requestIdToBetId[requestId] = betId;

        emit BetPlaced(betId, msg.sender, msg.value, block.timestamp);

        return betId;
    }

    /**
     * @dev Callback de Chainlink VRF (llamado automáticamente)
     * @param requestId ID de la solicitud
     * @param randomWords Array de números aleatorios
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 betId = requestIdToBetId[requestId];
        Bet storage bet = bets[betId];

        require(!bet.settled, "Bet already settled");

        // Obtener resultado (0 o 1)
        Side result = randomWords[0] % 2 == 0 ? Side.HEADS : Side.TAILS;

        // Determinar si ganó
        bool won = (result == bet.choice);

        // Procesar pago
        uint256 payout = 0;
        if (won) {
            payout = (bet.amount * 198) / 100; // 1.98x
            _payout(bet.player, payout);
        } else {
            _registerLoss(bet.player, bet.amount);
        }

        // Marcar como settled
        bet.settled = true;

        emit BetSettled(betId, bet.player, won, payout, uint256(result));
    }

    // ========== VIEW FUNCTIONS ==========

    function getBet(uint256 betId)
        external
        view
        returns (
            address player,
            uint256 amount,
            Side choice,
            bool settled
        )
    {
        Bet memory bet = bets[betId];
        return (bet.player, bet.amount, bet.choice, bet.settled);
    }
}
```

### Paso 4: Deploy

Actualizar `scripts/deploy.js`:

```javascript
// Configuración VRF para Polygon Mumbai
const VRF_CONFIG = {
  coordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
  keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
  subscriptionId: process.env.VRF_SUBSCRIPTION_ID_MUMBAI,
};

// Deploy CoinFlip con VRF
const CoinFlipVRF = await ethers.getContractFactory("CoinFlipVRF");
const coinFlip = await CoinFlipVRF.deploy(
  casinoAddress,
  minBet,
  maxBet,
  deployer.address,
  VRF_CONFIG.coordinator,
  VRF_CONFIG.keyHash,
  VRF_CONFIG.subscriptionId
);
```

### Paso 5: Añadir Consumer a Subscription

Después del deploy:

1. Ve a https://vrf.chain.link
2. Selecciona tu subscription
3. Click "Add consumer"
4. Pega la dirección del contrato del juego
5. Confirma la transacción

## 🎯 Configuraciones por Red

### Polygon Mumbai (Testnet)

```javascript
VRF_COORDINATOR: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed"
KEY_HASH: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
```

### Polygon Mainnet

```javascript
VRF_COORDINATOR: "0xAE975071Be8F8eE67addBC1A82488F1C24858067"
KEY_HASH: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93"
```

### Ethereum Sepolia (Testnet)

```javascript
VRF_COORDINATOR: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
KEY_HASH: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
```

### Ethereum Mainnet

```javascript
VRF_COORDINATOR: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909"
KEY_HASH: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef"
```

## 📊 Flujo de Usuario con VRF

### Sin VRF (Inmediato pero inseguro)
```
User clicks bet → Contract generates random → Result shown → 1 transaction
```

### Con VRF (Seguro pero con delay)
```
User clicks bet → Request sent → [Wait 1-2 blocks] → Chainlink responds → Result shown → 2 transactions
```

**Experiencia de Usuario:**
1. Usuario hace clic en "Bet"
2. Transacción 1 confirmada: "Spinning... please wait"
3. Espera ~30-60 segundos (en Polygon)
4. Chainlink responde automáticamente
5. Frontend detecta evento "BetSettled"
6. Muestra resultado: "You Won!" o "You Lost!"

## 💡 Frontend con VRF

```javascript
// placeBet.js
async function placeBet(choice) {
  // 1. Realizar apuesta
  const tx = await coinFlipContract.placeBet(choice, {
    value: ethers.parseEther("0.1")
  });

  const receipt = await tx.wait();

  // 2. Extraer betId del evento
  const event = receipt.logs.find(log => log.eventName === "BetPlaced");
  const betId = event.args.betId;

  // 3. Mostrar "Spinning..."
  showSpinningAnimation();

  // 4. Escuchar resultado (asíncrono)
  coinFlipContract.once(
    coinFlipContract.filters.BetSettled(betId),
    (betIdEvent, player, won, payout, result) => {
      hideSpinningAnimation();

      if (won) {
        showWinAnimation(payout);
      } else {
        showLossAnimation();
      }
    }
  );

  // 5. Timeout safety (en caso de que el evento no llegue)
  setTimeout(() => {
    // Consultar estado de la apuesta
    checkBetStatus(betId);
  }, 120000); // 2 minutos
}
```

## 🔧 Debugging

### Verificar Estado de Subscription

```javascript
const subscription = await coordinator.getSubscription(subscriptionId);
console.log("Balance:", subscription.balance.toString());
console.log("Consumers:", subscription.consumers);
```

### Eventos VRF

```solidity
event RandomWordsRequested(
  bytes32 indexed keyHash,
  uint256 requestId,
  uint256 preSeed,
  uint64 indexed subId,
  uint16 minimumRequestConfirmations,
  uint32 callbackGasLimit,
  uint32 numWords,
  address indexed sender
);

event RandomWordsFulfilled(
  uint256 indexed requestId,
  uint256 outputSeed,
  uint96 payment,
  bool success
);
```

## 📈 Estimación de Costos

| Red | Cost per Request | Block Time | Total Time |
|-----|------------------|------------|------------|
| Polygon Mumbai | FREE | ~2 sec | ~6-10 sec |
| Polygon Mainnet | ~$0.50 | ~2 sec | ~6-10 sec |
| Ethereum Sepolia | FREE | ~12 sec | ~36-48 sec |
| Ethereum Mainnet | ~$0.50 | ~12 sec | ~36-48 sec |

## 🎓 Recursos

- **Documentación**: https://docs.chain.link/vrf/v2/introduction
- **Subscription Manager**: https://vrf.chain.link
- **Faucets**:
  - Mumbai: https://faucets.chain.link/mumbai
  - Sepolia: https://faucets.chain.link/sepolia

## ⚡ Próximos Pasos

1. ✅ Implementar versiones VRF de todos los juegos
2. ✅ Testear en Mumbai testnet
3. ✅ Optimizar callback gas limit
4. ✅ Añadir manejo de errores robusto
5. ✅ Implementar sistema de reintentos
6. ✅ Auditar contratos
7. ✅ Deploy a mainnet

---

**Recuerda**: NUNCA uses el método pseudo-aleatorio en producción. Siempre usa Chainlink VRF para casinos y gambling en mainnet.
