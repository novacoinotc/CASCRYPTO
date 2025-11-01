// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseGame.sol";

/**
 * @title Roulette
 * @dev Ruleta Europea (0-36)
 *
 * Tipos de apuesta:
 * - Straight (número específico): 35:1
 * - Red/Black: 1:1
 * - Even/Odd: 1:1
 * - Low (1-18) / High (19-36): 1:1
 * - Dozen (1-12, 13-24, 25-36): 2:1
 * - Column: 2:1
 *
 * House Edge: ~2.7% (debido al 0)
 */
contract Roulette is BaseGame {

    // ========== ENUMS ==========

    enum BetType {
        STRAIGHT,       // Número específico (0-36)
        RED,           // Rojo
        BLACK,         // Negro
        EVEN,          // Par
        ODD,           // Impar
        LOW,           // 1-18
        HIGH,          // 19-36
        DOZEN_FIRST,   // 1-12
        DOZEN_SECOND,  // 13-24
        DOZEN_THIRD,   // 25-36
        COLUMN_FIRST,  // 1,4,7,10...34
        COLUMN_SECOND, // 2,5,8,11...35
        COLUMN_THIRD   // 3,6,9,12...36
    }

    // ========== STRUCTS ==========

    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint8 value;           // Para STRAIGHT, el número específico
        uint8 resultNumber;    // Número resultante
        uint256 multiplier;
        uint256 timestamp;
        bool settled;
    }

    // ========== STATE VARIABLES ==========

    /// @notice Mapping de ID de apuesta a Bet
    mapping(uint256 => Bet) public bets;

    /// @notice Mapping de números rojos
    mapping(uint8 => bool) public isRed;

    // ========== EVENTS ==========

    event RouletteSpun(
        uint256 indexed betId,
        address indexed player,
        BetType betType,
        uint8 value,
        uint8 resultNumber,
        bool won,
        uint256 payout,
        uint256 multiplier
    );

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     */
    constructor(
        address _casino,
        uint256 _minBet,
        uint256 _maxBet,
        address initialOwner
    ) BaseGame(_casino, 270, _minBet, _maxBet, initialOwner) {
        // House edge = 2.7% (270 basis points) - típico de ruleta europea

        // Inicializar números rojos (ruleta europea estándar)
        isRed[1] = true; isRed[3] = true; isRed[5] = true;
        isRed[7] = true; isRed[9] = true; isRed[12] = true;
        isRed[14] = true; isRed[16] = true; isRed[18] = true;
        isRed[19] = true; isRed[21] = true; isRed[23] = true;
        isRed[25] = true; isRed[27] = true; isRed[30] = true;
        isRed[32] = true; isRed[34] = true; isRed[36] = true;
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @dev Realizar apuesta en Ruleta
     * @param betType Tipo de apuesta
     * @param value Valor (solo para STRAIGHT, el número específico)
     */
    function placeBet(BetType betType, uint8 value)
        external
        payable
        nonReentrant
        whenNotPaused
        validBet(msg.value)
        returns (uint256 betId)
    {
        // Validar valor para STRAIGHT
        if (betType == BetType.STRAIGHT) {
            require(value <= 36, "Invalid number for straight bet");
        }

        // Validar y registrar apuesta
        _placeBet(msg.sender, msg.value);

        // Crear ID único
        betId = betIdCounter++;

        // Obtener multiplier para este tipo de apuesta
        uint256 multiplier = getMultiplier(betType);

        // Calcular potencial payout
        uint256 potentialPayout = _calculatePayout(msg.value, multiplier);

        // Validar fondos del casino
        require(
            potentialPayout <= casino.getBalance(),
            "Casino insufficient funds"
        );

        // Generar número aleatorio 0-36
        uint256 randomNumber = _generateRandomNumber(betId, 37);
        uint8 resultNumber = uint8(randomNumber);

        // Determinar si ganó
        bool won = checkWin(betType, value, resultNumber);

        // Procesar resultado
        uint256 payout = 0;
        if (won) {
            payout = potentialPayout;
            _payout(msg.sender, payout);
        } else {
            _registerLoss(msg.sender, msg.value);
        }

        // Guardar apuesta
        bets[betId] = Bet({
            player: msg.sender,
            amount: msg.value,
            betType: betType,
            value: value,
            resultNumber: resultNumber,
            multiplier: multiplier,
            timestamp: block.timestamp,
            settled: true
        });

        // Emitir eventos
        emit BetPlaced(betId, msg.sender, msg.value, block.timestamp);
        emit RouletteSpun(
            betId,
            msg.sender,
            betType,
            value,
            resultNumber,
            won,
            payout,
            multiplier
        );
        emit BetSettled(betId, msg.sender, won, payout, resultNumber);

        return betId;
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Verificar si una apuesta ganó
     */
    function checkWin(BetType betType, uint8 value, uint8 result)
        internal
        view
        returns (bool)
    {
        if (betType == BetType.STRAIGHT) {
            return result == value;
        }

        // El 0 solo gana en STRAIGHT
        if (result == 0) {
            return false;
        }

        if (betType == BetType.RED) {
            return isRed[result];
        }

        if (betType == BetType.BLACK) {
            return !isRed[result];
        }

        if (betType == BetType.EVEN) {
            return result % 2 == 0;
        }

        if (betType == BetType.ODD) {
            return result % 2 == 1;
        }

        if (betType == BetType.LOW) {
            return result >= 1 && result <= 18;
        }

        if (betType == BetType.HIGH) {
            return result >= 19 && result <= 36;
        }

        if (betType == BetType.DOZEN_FIRST) {
            return result >= 1 && result <= 12;
        }

        if (betType == BetType.DOZEN_SECOND) {
            return result >= 13 && result <= 24;
        }

        if (betType == BetType.DOZEN_THIRD) {
            return result >= 25 && result <= 36;
        }

        if (betType == BetType.COLUMN_FIRST) {
            return result % 3 == 1;
        }

        if (betType == BetType.COLUMN_SECOND) {
            return result % 3 == 2;
        }

        if (betType == BetType.COLUMN_THIRD) {
            return result % 3 == 0;
        }

        return false;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Obtener multiplier para un tipo de apuesta
     */
    function getMultiplier(BetType betType) public pure returns (uint256) {
        if (betType == BetType.STRAIGHT) {
            return 3500; // 35:1
        }

        if (
            betType == BetType.RED ||
            betType == BetType.BLACK ||
            betType == BetType.EVEN ||
            betType == BetType.ODD ||
            betType == BetType.LOW ||
            betType == BetType.HIGH
        ) {
            return 200; // 1:1 (2x total)
        }

        if (
            betType == BetType.DOZEN_FIRST ||
            betType == BetType.DOZEN_SECOND ||
            betType == BetType.DOZEN_THIRD ||
            betType == BetType.COLUMN_FIRST ||
            betType == BetType.COLUMN_SECOND ||
            betType == BetType.COLUMN_THIRD
        ) {
            return 300; // 2:1 (3x total)
        }

        return 100; // Default 1x
    }

    /**
     * @dev Obtener información de una apuesta
     */
    function getBet(uint256 betId)
        external
        view
        returns (
            address player,
            uint256 amount,
            BetType betType,
            uint8 value,
            uint8 resultNumber,
            uint256 multiplier,
            uint256 timestamp,
            bool settled
        )
    {
        Bet memory bet = bets[betId];
        return (
            bet.player,
            bet.amount,
            bet.betType,
            bet.value,
            bet.resultNumber,
            bet.multiplier,
            bet.timestamp,
            bet.settled
        );
    }

    /**
     * @dev Calcular potencial ganancia
     */
    function calculatePotentialWin(uint256 amount, BetType betType)
        external
        pure
        returns (uint256)
    {
        uint256 multiplier = getMultiplier(betType);
        return (amount * multiplier) / 100;
    }

    /**
     * @dev Verificar si un número es rojo
     */
    function isRedNumber(uint8 number) external view returns (bool) {
        require(number <= 36, "Invalid number");
        return isRed[number];
    }

    /**
     * @dev Obtener estadísticas del juego
     */
    function getGameStats()
        external
        view
        returns (
            uint256 totalBets,
            uint256 currentMinBet,
            uint256 currentMaxBet,
            uint256 currentHouseEdge
        )
    {
        return (
            betIdCounter,
            minBet,
            maxBet,
            houseEdge
        );
    }
}
