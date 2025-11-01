// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CasinoToken
 * @dev Token ERC-20 nativo del casino CASCRYPTO (CASC)
 *
 * Características:
 * - Total Supply: 100,000,000 CASC
 * - Burnable: Los tokens pueden ser quemados
 * - Pausable: Puede ser pausado en emergencias
 * - Mintable: Solo el owner puede mintear (para rewards)
 */
contract CasinoToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {

    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 millones

    /**
     * @dev Constructor que mintea el supply inicial al deployer
     */
    constructor(
        address initialOwner
    ) ERC20("Casino Crypto", "CASC") Ownable(initialOwner) {
        // Mintear supply inicial al owner
        _mint(initialOwner, MAX_SUPPLY);
    }

    /**
     * @dev Mintear nuevos tokens (solo owner)
     * @param to Dirección que recibirá los tokens
     * @param amount Cantidad de tokens a mintear
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Pausar el token (emergencias)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausar el token
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override necesario para heredar de múltiples contratos
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
