// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseGame.sol";

/**
 * @title CoinFlip
 * @dev Juego de cara o cruz (Heads or Tails)
 *
 * Mecánica:
 * - El jugador elige HEADS (0) o TAILS (1)
 * - Se genera un número aleatorio
 * - Si acierta, gana 1.98x su apuesta (2% house edge)
 * - Si falla, pierde su apuesta
 *
 * Probabilidad: 50/50
 * Payout: 1.98x
 * House Edge: 2%
 */
contract CoinFlip is BaseGame {

    // ========== ENUMS ==========

    enum Side {
        HEADS,
        TAILS
    }

    // ========== STRUCTS ==========

    struct Bet {
        address player;
        uint256 amount;
        Side choice;
        Side result;
        uint256 timestamp;
        bool settled;
    }

    // ========== STATE VARIABLES ==========

    /// @notice Mapping de ID de apuesta a Bet
    mapping(uint256 => Bet) public bets;

    /// @notice Multiplier fijo para CoinFlip (1.98x = 198)
    uint256 public constant MULTIPLIER = 198;

    // ========== EVENTS ==========

    event CoinFlipped(
        uint256 indexed betId,
        address indexed player,
        Side choice,
        Side result,
        bool won,
        uint256 payout
    );

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _casino Dirección del contrato Casino
     * @param _minBet Apuesta mínima (ej: 0.01 ETH = 10000000000000000 wei)
     * @param _maxBet Apuesta máxima (ej: 1 ETH = 1000000000000000000 wei)
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
     * @dev Realizar apuesta en Coin Flip
     * @param choice Elección del jugador (HEADS o TAILS)
     * @return betId ID de la apuesta creada
     */
    function placeBet(Side choice)
        external
        payable
        nonReentrant
        whenNotPaused
        validBet(msg.value)
        returns (uint256 betId)
    {
        // Validar y registrar apuesta en el casino
        _placeBet(msg.sender, msg.value);

        // Crear ID único para esta apuesta
        betId = betIdCounter++;

        // Generar resultado aleatorio
        uint256 randomNumber = _generateRandomNumber(betId, 2);
        Side result = randomNumber == 0 ? Side.HEADS : Side.TAILS;

        // Determinar si ganó
        bool won = (result == choice);

        // Calcular payout si ganó
        uint256 payout = 0;
        if (won) {
            payout = _calculatePayout(msg.value, MULTIPLIER);
            _payout(msg.sender, payout);
        } else {
            _registerLoss(msg.sender, msg.value);
        }

        // Guardar información de la apuesta
        bets[betId] = Bet({
            player: msg.sender,
            amount: msg.value,
            choice: choice,
            result: result,
            timestamp: block.timestamp,
            settled: true
        });

        // Emitir eventos
        emit BetPlaced(betId, msg.sender, msg.value, block.timestamp);
        emit CoinFlipped(betId, msg.sender, choice, result, won, payout);
        emit BetSettled(betId, msg.sender, won, payout, uint256(result));

        return betId;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Obtener información de una apuesta
     * @param betId ID de la apuesta
     */
    function getBet(uint256 betId)
        external
        view
        returns (
            address player,
            uint256 amount,
            Side choice,
            Side result,
            uint256 timestamp,
            bool settled
        )
    {
        Bet memory bet = bets[betId];
        return (
            bet.player,
            bet.amount,
            bet.choice,
            bet.result,
            bet.timestamp,
            bet.settled
        );
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
            uint256 currentHouseEdge,
            uint256 multiplier
        )
    {
        return (
            betIdCounter,
            minBet,
            maxBet,
            houseEdge,
            MULTIPLIER
        );
    }

    /**
     * @dev Calcular potencial ganancia para una apuesta
     * @param amount Cantidad a apostar
     */
    function calculatePotentialWin(uint256 amount)
        external
        pure
        returns (uint256)
    {
        return (amount * MULTIPLIER) / 100;
    }
}
