// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseGame.sol";

/**
 * @title Dice
 * @dev Juego de dados con probabilidad variable
 *
 * Mecánica:
 * - El jugador elige un número del 1 al 99
 * - Se genera un número aleatorio del 1 al 100
 * - Si el número aleatorio es <= al número elegido, GANA
 * - Si es mayor, PIERDE
 *
 * Ejemplo:
 * - Elige 50: 50% de probabilidad, multiplier ~1.96x
 * - Elige 10: 10% de probabilidad, multiplier ~9.8x
 * - Elige 90: 90% de probabilidad, multiplier ~1.09x
 *
 * House Edge: 2%
 */
contract Dice is BaseGame {

    // ========== STRUCTS ==========

    struct Bet {
        address player;
        uint256 amount;
        uint8 numberChosen;     // 1-99
        uint8 resultNumber;     // 1-100
        uint256 multiplier;     // Multiplicador con 2 decimales
        uint256 timestamp;
        bool settled;
    }

    // ========== STATE VARIABLES ==========

    /// @notice Mapping de ID de apuesta a Bet
    mapping(uint256 => Bet) public bets;

    // ========== EVENTS ==========

    event DiceRolled(
        uint256 indexed betId,
        address indexed player,
        uint8 numberChosen,
        uint8 resultNumber,
        bool won,
        uint256 payout,
        uint256 multiplier
    );

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _casino Dirección del contrato Casino
     * @param _minBet Apuesta mínima
     * @param _maxBet Apuesta máxima
     */
    constructor(
        address _casino,
        uint256 _minBet,
        uint256 _maxBet,
        address initialOwner
    ) BaseGame(_casino, 200, _minBet, _maxBet, initialOwner) {
        // House edge = 2% (200 basis points)
    }

    // ========== EXTERNAL FUNCTIONS ==========

    /**
     * @dev Realizar apuesta en Dice
     * @param numberChosen Número elegido (1-99)
     * @return betId ID de la apuesta creada
     */
    function placeBet(uint8 numberChosen)
        external
        payable
        nonReentrant
        whenNotPaused
        validBet(msg.value)
        returns (uint256 betId)
    {
        require(numberChosen >= 1 && numberChosen <= 99, "Number must be 1-99");

        // Validar y registrar apuesta en el casino
        _placeBet(msg.sender, msg.value);

        // Crear ID único
        betId = betIdCounter++;

        // Calcular multiplier basado en probabilidad
        // Formula: (10000 - houseEdge) / numberChosen / 100
        // Ejemplo: numberChosen=50, houseEdge=200
        // multiplier = 9800 / 50 / 100 = 1.96
        uint256 multiplier = ((10000 - houseEdge) * 100) / numberChosen / 100;

        // Calcular potencial payout
        uint256 potentialPayout = _calculatePayout(msg.value, multiplier);

        // Validar que el casino puede pagar
        require(
            potentialPayout <= casino.getBalance(),
            "Casino insufficient funds"
        );

        // Generar número aleatorio 1-100
        uint256 randomNumber = _generateRandomNumber(betId, 100) + 1;
        uint8 resultNumber = uint8(randomNumber);

        // Determinar si ganó
        bool won = (resultNumber <= numberChosen);

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
            numberChosen: numberChosen,
            resultNumber: resultNumber,
            multiplier: multiplier,
            timestamp: block.timestamp,
            settled: true
        });

        // Emitir eventos
        emit BetPlaced(betId, msg.sender, msg.value, block.timestamp);
        emit DiceRolled(
            betId,
            msg.sender,
            numberChosen,
            resultNumber,
            won,
            payout,
            multiplier
        );
        emit BetSettled(betId, msg.sender, won, payout, resultNumber);

        return betId;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Obtener información de una apuesta
     */
    function getBet(uint256 betId)
        external
        view
        returns (
            address player,
            uint256 amount,
            uint8 numberChosen,
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
            bet.numberChosen,
            bet.resultNumber,
            bet.multiplier,
            bet.timestamp,
            bet.settled
        );
    }

    /**
     * @dev Calcular multiplier para un número
     * @param numberChosen Número elegido (1-99)
     * @return multiplier Multiplicador con 2 decimales
     */
    function calculateMultiplier(uint8 numberChosen)
        public
        view
        returns (uint256 multiplier)
    {
        require(numberChosen >= 1 && numberChosen <= 99, "Number must be 1-99");
        multiplier = ((10000 - houseEdge) * 100) / numberChosen / 100;
        return multiplier;
    }

    /**
     * @dev Calcular potencial ganancia
     * @param amount Cantidad a apostar
     * @param numberChosen Número elegido (1-99)
     * @return potentialWin Ganancia potencial
     */
    function calculatePotentialWin(uint256 amount, uint8 numberChosen)
        external
        view
        returns (uint256 potentialWin)
    {
        require(numberChosen >= 1 && numberChosen <= 99, "Number must be 1-99");
        uint256 multiplier = calculateMultiplier(numberChosen);
        potentialWin = _calculatePayout(amount, multiplier);
        return potentialWin;
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
