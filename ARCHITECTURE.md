# 🏗️ Arquitectura Técnica - CASCRYPTO

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Smart Contracts](#smart-contracts)
3. [Sistema de Randomness](#sistema-de-randomness)
4. [Flujo de Apuestas](#flujo-de-apuestas)
5. [Seguridad](#seguridad)
6. [Gas Optimization](#gas-optimization)

## Visión General

CASCRYPTO es un casino completamente descentralizado que opera mediante smart contracts en blockchain. A diferencia de casinos tradicionales centralizados, toda la lógica de negocio, pagos, y generación de números aleatorios está en la blockchain.

### Principios de Diseño

1. **Transparencia Total**: Todo el código es open-source y verificable
2. **No Custodial**: Los usuarios nunca pierden control de sus fondos hasta que apuestan
3. **Provably Fair**: Cada resultado es verificable on-chain
4. **Inmutable**: Una vez desplegado, las reglas no pueden cambiar arbitrariamente
5. **Automatizado**: Sin intervención humana en pagos o resultados

## Smart Contracts

### 1. CasinoToken.sol (Token ERC-20)

**Propósito**: Token nativo del casino (CASC)

```solidity
// Características principales
- Total Supply: 100,000,000 CASC
- Decimales: 18
- Burnable: Sí
- Mintable: Solo por el casino (para rewards)
- Pausable: Sí (emergencias)
```

**Funcionalidad**:
- Token de utilidad y governance
- Puede usarse para apostar en lugar de ETH/MATIC
- Staking para recibir parte de house profits
- Descuentos en house edge para holders

### 2. Casino.sol (Contrato Principal)

**Propósito**: Core del casino, gestiona bankroll y coordina juegos

```solidity
contract Casino {
    // Estado principal
    uint256 public bankroll;           // Fondos totales del casino
    uint256 public minBet;             // Apuesta mínima
    uint256 public maxBet;             // Apuesta máxima (% del bankroll)

    // Roles
    address public owner;
    address public treasury;

    // Juegos registrados
    mapping(address => bool) public authorizedGames;

    // Funciones principales
    function placeBet(address game, ...) external payable;
    function settleBet(uint256 betId, ...) external;
    function addLiquidity() external payable;
    function removeLiquidity(uint256 amount) external;
}
```

**Características**:
- **Bankroll Management**: Pool de liquidez para pagar premios
- **Game Registry**: Solo juegos autorizados pueden interactuar
- **Emergency Pause**: Sistema de pausa en caso de exploit
- **Liquidity Providers**: Usuarios pueden aportar liquidez y ganar fees

### 3. Games/ (Contratos de Juegos)

Cada juego hereda de `BaseGame.sol` que proporciona:
- Conexión con Casino.sol
- Validación de apuestas
- Sistema de eventos
- Protección contra reentrancy

#### 3.1 Dice.sol (Dados)

```solidity
contract Dice is BaseGame {
    // Jugador elige un número del 1-100
    // Gana si el random número es <= su elección

    struct Bet {
        address player;
        uint256 amount;
        uint8 numberChosen;  // 1-100
        uint256 payout;
        bool settled;
    }

    function placeBet(uint8 number) external payable {
        require(number >= 1 && number <= 99, "Invalid number");

        // Calcular payout basado en probabilidad
        // Si elige 50: 50% chance = 2x multiplier
        // Si elige 10: 10% chance = 10x multiplier
        uint256 multiplier = (100 * 98) / number; // 98% = house edge 2%
        uint256 potentialPayout = msg.value * multiplier / 100;

        // Solicitar random number a VRF
        uint256 requestId = requestRandomness();

        // Guardar apuesta
        bets[requestId] = Bet({
            player: msg.sender,
            amount: msg.value,
            numberChosen: number,
            payout: potentialPayout,
            settled: false
        });
    }

    function fulfillRandomness(uint256 requestId, uint256 randomness) internal {
        Bet storage bet = bets[requestId];

        // Generar número 1-100
        uint256 result = (randomness % 100) + 1;

        // Verificar si ganó
        if (result <= bet.numberChosen) {
            // GANÓ
            _payout(bet.player, bet.payout);
            emit Win(bet.player, bet.amount, bet.payout, result);
        } else {
            // PERDIÓ
            emit Loss(bet.player, bet.amount, result);
        }

        bet.settled = true;
    }
}
```

#### 3.2 Roulette.sol (Ruleta)

```solidity
contract Roulette is BaseGame {
    enum BetType {
        StraightUp,    // Número específico (0-36): 35:1
        Red,           // Rojo: 1:1
        Black,         // Negro: 1:1
        Even,          // Par: 1:1
        Odd,           // Impar: 1:1
        Low,           // 1-18: 1:1
        High,          // 19-36: 1:1
        Dozen,         // Docena: 2:1
        Column         // Columna: 2:1
    }

    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint8 value;      // Número específico o 0
        uint256 payout;
        bool settled;
    }

    // Configuración de números
    mapping(uint8 => bool) public isRed;

    constructor() {
        // Números rojos en ruleta europea
        isRed[1] = true; isRed[3] = true; isRed[5] = true;
        // ... etc
    }

    function placeBet(BetType betType, uint8 value) external payable {
        require(msg.value >= minBet, "Bet too low");

        uint256 multiplier = getMultiplier(betType);
        uint256 potentialPayout = msg.value * multiplier;

        uint256 requestId = requestRandomness();

        bets[requestId] = Bet({
            player: msg.sender,
            amount: msg.value,
            betType: betType,
            value: value,
            payout: potentialPayout,
            settled: false
        });
    }

    function fulfillRandomness(uint256 requestId, uint256 randomness) internal {
        Bet storage bet = bets[requestId];

        // Generar número 0-36
        uint8 result = uint8(randomness % 37);

        bool won = checkWin(bet.betType, bet.value, result);

        if (won) {
            _payout(bet.player, bet.payout);
            emit Win(bet.player, bet.amount, bet.payout, result);
        } else {
            emit Loss(bet.player, bet.amount, result);
        }

        bet.settled = true;
    }

    function checkWin(BetType betType, uint8 value, uint8 result) internal view returns (bool) {
        if (betType == BetType.StraightUp) return result == value;
        if (betType == BetType.Red) return isRed[result];
        if (betType == BetType.Black) return !isRed[result] && result != 0;
        if (betType == BetType.Even) return result != 0 && result % 2 == 0;
        if (betType == BetType.Odd) return result % 2 == 1;
        // ... más lógica
    }
}
```

#### 3.3 CoinFlip.sol (Cara o Cruz)

```solidity
contract CoinFlip is BaseGame {
    enum Side { HEADS, TAILS }

    struct Bet {
        address player;
        uint256 amount;
        Side choice;
        bool settled;
    }

    function placeBet(Side choice) external payable {
        require(msg.value >= minBet, "Bet too low");

        // 1.98x multiplier (2% house edge)
        uint256 potentialPayout = msg.value * 198 / 100;

        uint256 requestId = requestRandomness();

        bets[requestId] = Bet({
            player: msg.sender,
            amount: msg.value,
            choice: choice,
            settled: false
        });
    }

    function fulfillRandomness(uint256 requestId, uint256 randomness) internal {
        Bet storage bet = bets[requestId];

        Side result = randomness % 2 == 0 ? Side.HEADS : Side.TAILS;

        if (result == bet.choice) {
            uint256 payout = bet.amount * 198 / 100;
            _payout(bet.player, payout);
            emit Win(bet.player, bet.amount, payout, uint8(result));
        } else {
            emit Loss(bet.player, bet.amount, uint8(result));
        }

        bet.settled = true;
    }
}
```

## Sistema de Randomness

### Problema: Randomness en Blockchain

Blockchain es determinista, por lo que generar números verdaderamente aleatorios es imposible. Existen varias soluciones:

### ❌ Soluciones MALAS (No usar)

1. **block.timestamp**: Mineros pueden manipular
2. **block.difficulty**: Predecible
3. **blockhash**: Vulnerable a ataques

### ✅ Soluciones BUENAS

#### Opción 1: Chainlink VRF (Recomendado)

```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract RandomNumberConsumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    mapping(uint256 => uint256) public requestIdToRandomNumber;

    function requestRandomness() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        // Esta función es llamada por Chainlink con el número random
        requestIdToRandomNumber[requestId] = randomWords[0];

        // Procesar la apuesta con el número random
        processResult(requestId, randomWords[0]);
    }
}
```

**Ventajas**:
- ✅ Seguro y verificable
- ✅ Estándar de la industria
- ✅ Auditable on-chain

**Desventajas**:
- ❌ Cuesta LINK tokens (~$0.50 por request)
- ❌ Delay de 1-2 bloques (asíncrono)

#### Opción 2: Commit-Reveal Scheme

```solidity
contract CommitReveal {
    struct Commitment {
        bytes32 commitment;
        uint256 revealDeadline;
        bool revealed;
    }

    mapping(address => Commitment) public commitments;

    // Fase 1: Player comitea un hash
    function commit(bytes32 hash) external {
        commitments[msg.sender] = Commitment({
            commitment: hash,
            revealDeadline: block.timestamp + 1 hours,
            revealed: false
        });
    }

    // Fase 2: Player revela el secreto
    function reveal(uint256 secret) external {
        Commitment storage c = commitments[msg.sender];
        require(!c.revealed, "Already revealed");
        require(block.timestamp <= c.revealDeadline, "Too late");

        bytes32 hash = keccak256(abi.encodePacked(secret));
        require(hash == c.commitment, "Invalid reveal");

        // Combinar con blockhash para randomness
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            secret,
            blockhash(block.number - 1)
        )));

        // Procesar resultado
        processResult(msg.sender, randomness);
        c.revealed = true;
    }
}
```

**Ventajas**:
- ✅ Gratis (no requiere oráculos)
- ✅ Más rápido

**Desventajas**:
- ❌ Requiere 2 transacciones del jugador
- ❌ Casino puede no revelar si perdería mucho dinero

#### Opción 3: Hybrid (Commit-Reveal + Chainlink)

Para testnet/desarrollo usamos Commit-Reveal, para mainnet Chainlink VRF.

## Flujo de Apuestas

### Diagrama de Secuencia

```
Player          Frontend        Dice.sol        VRF Oracle      Casino.sol
  |                |               |                 |               |
  |--Click "Bet"-->|               |                 |               |
  |                |               |                 |               |
  |                |--placeBet()-->|                 |               |
  |                |   +ETH        |                 |               |
  |                |               |                 |               |
  |                |               |--requestRandom->|               |
  |                |               |                 |               |
  |                |               |<--requestId-----|               |
  |                |               |                 |               |
  |                |<--Pending-----|                 |               |
  |<--"Spinning"---|               |                 |               |
  |                |               |                 |               |
  |                |               |    [Wait 1-2 blocks]            |
  |                |               |                 |               |
  |                |               |<--fulfillRandom-|               |
  |                |               |   (randomNum)   |               |
  |                |               |                 |               |
  |                |               |--If Won-------->|--transfer()-->|
  |                |               |                 |               |
  |<--Result-------|<--Event-------|                 |               |
  |    Won/Lost    |   Emitted     |                 |               |
```

### Código Frontend (React)

```javascript
// Realizar apuesta
async function placeBet(number) {
    const tx = await diceContract.placeBet(number, {
        value: ethers.utils.parseEther("0.1")
    });

    // Esperar confirmación
    const receipt = await tx.wait();

    // Extraer requestId del evento
    const event = receipt.events.find(e => e.event === "BetPlaced");
    const requestId = event.args.requestId;

    // Escuchar resultado
    diceContract.once("BetSettled", (reqId, player, won, payout) => {
        if (reqId.toString() === requestId.toString()) {
            if (won) {
                showWinAnimation(payout);
            } else {
                showLossAnimation();
            }
        }
    });
}
```

## Seguridad

### 1. Reentrancy Protection

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Casino is ReentrancyGuard {
    function placeBet() external payable nonReentrant {
        // Protegido contra reentrancy
    }
}
```

### 2. Access Control

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Casino is AccessControl {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    modifier onlyGame() {
        require(hasRole(GAME_ROLE, msg.sender), "Not authorized");
        _;
    }
}
```

### 3. Emergency Pause

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract Casino is Pausable {
    function pause() external onlyOwner {
        _pause();
    }

    function placeBet() external whenNotPaused {
        // Solo funciona si no está pausado
    }
}
```

### 4. Max Bet Limits

```solidity
function placeBet() external payable {
    require(msg.value >= minBet, "Bet too small");

    // Limitar apuesta a 1% del bankroll
    uint256 maxBet = bankroll / 100;
    require(msg.value <= maxBet, "Bet too large");

    // Verificar que hay fondos suficientes para pagar
    uint256 potentialPayout = calculatePayout(msg.value);
    require(potentialPayout <= bankroll, "Insufficient bankroll");
}
```

## Gas Optimization

### 1. Usar uint256 en lugar de uint8/uint16

```solidity
// ❌ Más caro
uint8 public number = 5;

// ✅ Más barato
uint256 public number = 5;
```

### 2. Pack Variables en Slots

```solidity
// ❌ Usa 3 slots
address player;      // slot 0
uint256 amount;      // slot 1
bool settled;        // slot 2

// ✅ Usa 2 slots
address player;      // slot 0 (20 bytes)
bool settled;        // slot 0 (1 byte) - packed!
uint256 amount;      // slot 1
```

### 3. Events en lugar de Storage

```solidity
// ❌ Muy caro guardar en storage
mapping(uint256 => Bet[]) public userBets;

// ✅ Emitir evento, guardar off-chain
event BetPlaced(address indexed user, uint256 amount, uint256 betId);
```

### 4. Immutable y Constant

```solidity
// ✅ No usa storage, hardcoded en bytecode
address public immutable casino;
uint256 public constant HOUSE_EDGE = 200; // 2%
```

## Estimaciones de Costos

### Testnet (Polygon Mumbai)
- Deploy Casino: ~0 MATIC (gratis)
- Place Bet: ~$0.001
- Fulfill Random: ~$0.001

### Mainnet (Polygon)
- Deploy Casino: ~$5-10
- Place Bet: ~$0.01-0.05
- Chainlink VRF: ~$0.50/request

### Mainnet (Ethereum)
- Deploy Casino: ~$500-1000
- Place Bet: ~$5-20
- Chainlink VRF: ~$0.50/request

## Conclusión

Esta arquitectura proporciona:
- ✅ Seguridad mediante auditoría y mejores prácticas
- ✅ Transparencia total on-chain
- ✅ Costos razonables en Polygon
- ✅ Escalabilidad mediante design modular
- ✅ Provably fair mediante Chainlink VRF

La implementación completa está en los contratos de la carpeta `/contracts/`.
