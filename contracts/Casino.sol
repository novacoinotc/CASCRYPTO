// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Casino
 * @dev Contrato principal del casino que gestiona el bankroll y coordina los juegos
 *
 * Funcionalidades:
 * - Gestión de bankroll (pool de liquidez)
 * - Registro y autorización de juegos
 * - Sistema de apuestas mínimas y máximas
 * - Liquidity providers pueden aportar fondos
 * - Sistema de pausa para emergencias
 */
contract Casino is AccessControl, ReentrancyGuard, Pausable {

    // ========== ROLES ==========
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ========== STATE VARIABLES ==========

    /// @notice Bankroll total del casino (en wei)
    uint256 public bankroll;

    /// @notice Apuesta mínima (en wei)
    uint256 public minBet;

    /// @notice Porcentaje máximo del bankroll que se puede apostar (basis points: 100 = 1%)
    uint256 public maxBetPercentage;

    /// @notice House edge en basis points (200 = 2%)
    uint256 public houseEdge;

    /// @notice Treasury address para las ganancias del casino
    address public treasury;

    /// @notice Total de ganancias acumuladas
    uint256 public totalProfits;

    /// @notice Total de pérdidas acumuladas
    uint256 public totalLosses;

    /// @notice Mapping de juegos autorizados
    mapping(address => bool) public authorizedGames;

    /// @notice Mapping de liquidity providers
    mapping(address => uint256) public liquidityProviders;

    /// @notice Total de liquidez proporcionada por LPs
    uint256 public totalLiquidityProvided;

    // ========== EVENTS ==========

    event BankrollIncreased(address indexed provider, uint256 amount, uint256 newBankroll);
    event BankrollDecreased(address indexed provider, uint256 amount, uint256 newBankroll);
    event GameAuthorized(address indexed game);
    event GameRevoked(address indexed game);
    event BetPlaced(address indexed game, address indexed player, uint256 amount);
    event BetSettled(address indexed game, address indexed player, bool won, uint256 payout);
    event MinBetUpdated(uint256 newMinBet);
    event MaxBetPercentageUpdated(uint256 newMaxBetPercentage);
    event HouseEdgeUpdated(uint256 newHouseEdge);
    event TreasuryUpdated(address indexed newTreasury);
    event ProfitWithdrawn(address indexed treasury, uint256 amount);

    // ========== CONSTRUCTOR ==========

    /**
     * @dev Constructor
     * @param _treasury Dirección del treasury
     * @param _minBet Apuesta mínima inicial
     * @param _maxBetPercentage Porcentaje máximo de apuesta (basis points)
     * @param _houseEdge House edge en basis points
     */
    constructor(
        address _treasury,
        uint256 _minBet,
        uint256 _maxBetPercentage,
        uint256 _houseEdge
    ) payable {
        require(_treasury != address(0), "Invalid treasury");
        require(_maxBetPercentage > 0 && _maxBetPercentage <= 1000, "Invalid max bet %"); // Max 10%
        require(_houseEdge >= 0 && _houseEdge <= 1000, "Invalid house edge"); // Max 10%

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);

        treasury = _treasury;
        minBet = _minBet;
        maxBetPercentage = _maxBetPercentage;
        houseEdge = _houseEdge;

        // Inicializar bankroll con ETH enviado en el constructor
        if (msg.value > 0) {
            bankroll = msg.value;
            emit BankrollIncreased(msg.sender, msg.value, bankroll);
        }
    }

    // ========== LIQUIDITY PROVIDER FUNCTIONS ==========

    /**
     * @dev Añadir liquidez al casino
     */
    function addLiquidity() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");

        liquidityProviders[msg.sender] += msg.value;
        totalLiquidityProvided += msg.value;
        bankroll += msg.value;

        emit BankrollIncreased(msg.sender, msg.value, bankroll);
    }

    /**
     * @dev Retirar liquidez del casino
     * @param amount Cantidad a retirar
     */
    function removeLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(liquidityProviders[msg.sender] >= amount, "Insufficient liquidity");
        require(address(this).balance >= amount, "Insufficient casino balance");

        liquidityProviders[msg.sender] -= amount;
        totalLiquidityProvided -= amount;
        bankroll -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit BankrollDecreased(msg.sender, amount, bankroll);
    }

    // ========== GAME FUNCTIONS ==========

    /**
     * @dev Autorizar un juego para interactuar con el casino
     * @param game Dirección del contrato del juego
     */
    function authorizeGame(address game) external onlyRole(OPERATOR_ROLE) {
        require(game != address(0), "Invalid game address");
        require(!authorizedGames[game], "Game already authorized");

        authorizedGames[game] = true;
        _grantRole(GAME_ROLE, game);

        emit GameAuthorized(game);
    }

    /**
     * @dev Revocar autorización de un juego
     * @param game Dirección del contrato del juego
     */
    function revokeGame(address game) external onlyRole(OPERATOR_ROLE) {
        require(authorizedGames[game], "Game not authorized");

        authorizedGames[game] = false;
        _revokeRole(GAME_ROLE, game);

        emit GameRevoked(game);
    }

    /**
     * @dev Registrar una apuesta (llamado por juegos autorizados)
     * @param player Dirección del jugador
     * @param amount Cantidad apostada
     */
    function placeBet(address player, uint256 amount)
        external
        onlyRole(GAME_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(amount >= minBet, "Bet below minimum");

        uint256 maxBet = (bankroll * maxBetPercentage) / 10000;
        require(amount <= maxBet, "Bet exceeds maximum");

        emit BetPlaced(msg.sender, player, amount);
    }

    /**
     * @dev Pagar ganancias a un jugador (llamado por juegos autorizados)
     * @param player Dirección del jugador
     * @param payout Cantidad a pagar
     */
    function payoutWin(address player, uint256 payout)
        external
        onlyRole(GAME_ROLE)
        nonReentrant
    {
        require(payout > 0, "Invalid payout");
        require(address(this).balance >= payout, "Insufficient balance");

        totalLosses += payout;

        (bool success, ) = player.call{value: payout}("");
        require(success, "Payout failed");

        emit BetSettled(msg.sender, player, true, payout);
    }

    /**
     * @dev Registrar pérdida de un jugador (llamado por juegos autorizados)
     * @param player Dirección del jugador
     * @param amount Cantidad perdida
     */
    function registerLoss(address player, uint256 amount)
        external
        onlyRole(GAME_ROLE)
    {
        totalProfits += amount;
        bankroll += amount;

        emit BetSettled(msg.sender, player, false, 0);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Actualizar apuesta mínima
     */
    function setMinBet(uint256 _minBet) external onlyRole(OPERATOR_ROLE) {
        minBet = _minBet;
        emit MinBetUpdated(_minBet);
    }

    /**
     * @dev Actualizar porcentaje máximo de apuesta
     */
    function setMaxBetPercentage(uint256 _maxBetPercentage) external onlyRole(OPERATOR_ROLE) {
        require(_maxBetPercentage > 0 && _maxBetPercentage <= 1000, "Invalid percentage");
        maxBetPercentage = _maxBetPercentage;
        emit MaxBetPercentageUpdated(_maxBetPercentage);
    }

    /**
     * @dev Actualizar house edge
     */
    function setHouseEdge(uint256 _houseEdge) external onlyRole(OPERATOR_ROLE) {
        require(_houseEdge >= 0 && _houseEdge <= 1000, "Invalid house edge");
        houseEdge = _houseEdge;
        emit HouseEdgeUpdated(_houseEdge);
    }

    /**
     * @dev Actualizar treasury address
     */
    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @dev Retirar ganancias al treasury
     */
    function withdrawProfits(uint256 amount) external onlyRole(OPERATOR_ROLE) nonReentrant {
        require(amount > 0, "Invalid amount");
        require(amount <= totalProfits, "Exceeds profits");
        require(address(this).balance >= amount, "Insufficient balance");

        totalProfits -= amount;

        (bool success, ) = treasury.call{value: amount}("");
        require(success, "Transfer failed");

        emit ProfitWithdrawn(treasury, amount);
    }

    /**
     * @dev Pausar el casino (emergencias)
     */
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    /**
     * @dev Despausar el casino
     */
    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Obtener la apuesta máxima actual
     */
    function getMaxBet() external view returns (uint256) {
        return (bankroll * maxBetPercentage) / 10000;
    }

    /**
     * @dev Obtener el balance del contrato
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Verificar si un juego está autorizado
     */
    function isGameAuthorized(address game) external view returns (bool) {
        return authorizedGames[game];
    }

    /**
     * @dev Obtener liquidez proporcionada por un LP
     */
    function getLiquidityProvided(address provider) external view returns (uint256) {
        return liquidityProviders[provider];
    }

    /**
     * @dev Calcular multiplier para un juego basado en house edge
     * @param probability Probabilidad de ganar (basis points: 5000 = 50%)
     */
    function calculateMultiplier(uint256 probability) public view returns (uint256) {
        require(probability > 0 && probability < 10000, "Invalid probability");

        // Multiplier = (10000 - houseEdge) / probability
        // Multiplicado por 100 para mantener decimales
        return ((10000 - houseEdge) * 10000) / probability;
    }

    // ========== RECEIVE ==========

    /**
     * @dev Recibir ETH directamente
     */
    receive() external payable {
        bankroll += msg.value;
        emit BankrollIncreased(msg.sender, msg.value, bankroll);
    }
}
