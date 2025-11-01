// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Casino.sol";

/**
 * @title BaseGame
 * @dev Contrato base para todos los juegos del casino
 *
 * Proporciona:
 * - Conexión con el contrato Casino
 * - Gestión de apuestas básicas
 * - Sistema de números aleatorios
 * - Eventos estándar
 * - Protección contra reentrancy
 */
abstract contract BaseGame is ReentrancyGuard, Pausable, Ownable {

    // ========== STATE VARIABLES ==========

    /// @notice Referencia al contrato Casino principal
    Casino public casino;

    /// @notice Contador de IDs de apuestas
    uint256 public betIdCounter;

    /// @notice House edge para este juego (basis points)
    uint256 public houseEdge;

    /// @notice Apuesta mínima para este juego
    uint256 public minBet;

    /// @notice Apuesta máxima para este juego
    uint256 public maxBet;

    // ========== STRUCTS ==========

    /// @notice Información básica de una apuesta
    struct BaseBet {
        address player;
        uint256 amount;
        uint256 timestamp;
        bool settled;
    }

    // ========== EVENTS ==========

    event BetPlaced(
        uint256 indexed betId,
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );

    event BetSettled(
        uint256 indexed betId,
        address indexed player,
        bool won,
        uint256 payout,
        uint256 result
    );

    event HouseEdgeUpdated(uint256 newHouseEdge);
    event MinBetUpdated(uint256 newMinBet);
    event MaxBetUpdated(uint256 newMaxBet);

    // ========== MODIFIERS ==========

    /**
     * @dev Verificar que la apuesta sea válida
     */
    modifier validBet(uint256 amount) {
        require(amount >= minBet, "Bet below minimum");
        require(amount <= maxBet, "Bet exceeds maximum");
        require(amount >= casino.minBet(), "Bet below casino minimum");
        require(amount <= casino.getMaxBet(), "Bet exceeds casino maximum");
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _casino Dirección del contrato Casino
     * @param _houseEdge House edge en basis points
     * @param _minBet Apuesta mínima
     * @param _maxBet Apuesta máxima
     */
    constructor(
        address _casino,
        uint256 _houseEdge,
        uint256 _minBet,
        uint256 _maxBet,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_casino != address(0), "Invalid casino address");
        require(_houseEdge <= 1000, "House edge too high"); // Max 10%
        require(_minBet > 0, "Invalid min bet");
        require(_maxBet > _minBet, "Invalid max bet");

        casino = Casino(_casino);
        houseEdge = _houseEdge;
        minBet = _minBet;
        maxBet = _maxBet;
        betIdCounter = 0;
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Generar un número pseudo-aleatorio
     * NOTA: Este método NO es seguro para producción
     * En producción debe usarse Chainlink VRF
     *
     * @param seed Semilla para el random
     * @param max Valor máximo (exclusivo)
     * @return Número aleatorio entre 0 y max-1
     */
    function _generateRandomNumber(uint256 seed, uint256 max)
        internal
        view
        returns (uint256)
    {
        // ADVERTENCIA: Esto es vulnerable a manipulación por mineros
        // Solo usar en testnet o desarrollo
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    seed,
                    betIdCounter
                )
            )
        ) % max;
    }

    /**
     * @dev Calcular payout basado en multiplier
     * @param amount Cantidad apostada
     * @param multiplier Multiplicador (con 2 decimales, ej: 250 = 2.50x)
     * @return Payout total
     */
    function _calculatePayout(uint256 amount, uint256 multiplier)
        internal
        pure
        returns (uint256)
    {
        return (amount * multiplier) / 100;
    }

    /**
     * @dev Procesar pago de ganancia
     * @param player Dirección del jugador
     * @param payout Cantidad a pagar
     */
    function _payout(address player, uint256 payout) internal {
        casino.payoutWin(player, payout);
    }

    /**
     * @dev Registrar pérdida en el casino
     * @param player Dirección del jugador
     * @param amount Cantidad perdida
     */
    function _registerLoss(address player, uint256 amount) internal {
        casino.registerLoss(player, amount);
    }

    /**
     * @dev Validar y registrar apuesta en el casino
     * @param player Dirección del jugador
     * @param amount Cantidad apostada
     */
    function _placeBet(address player, uint256 amount) internal {
        casino.placeBet(player, amount);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Actualizar house edge
     */
    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        require(_houseEdge <= 1000, "House edge too high");
        houseEdge = _houseEdge;
        emit HouseEdgeUpdated(_houseEdge);
    }

    /**
     * @dev Actualizar apuesta mínima
     */
    function setMinBet(uint256 _minBet) external onlyOwner {
        require(_minBet > 0, "Invalid min bet");
        minBet = _minBet;
        emit MinBetUpdated(_minBet);
    }

    /**
     * @dev Actualizar apuesta máxima
     */
    function setMaxBet(uint256 _maxBet) external onlyOwner {
        require(_maxBet > minBet, "Invalid max bet");
        maxBet = _maxBet;
        emit MaxBetUpdated(_maxBet);
    }

    /**
     * @dev Pausar el juego
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausar el juego
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Obtener información del casino
     */
    function getCasinoInfo()
        external
        view
        returns (
            uint256 casinoBankroll,
            uint256 casinoMinBet,
            uint256 casinoMaxBet
        )
    {
        return (
            casino.bankroll(),
            casino.minBet(),
            casino.getMaxBet()
        );
    }
}
