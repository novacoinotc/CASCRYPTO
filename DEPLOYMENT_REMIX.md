# 🚀 Desplegar Casino con Remix IDE (10 minutos)

## ✅ Requisitos
- Navegador (Chrome/Brave/Firefox)
- MetaMask instalado
- MATIC de testnet (gratis)

---

## 📝 Paso 1: Obtener MATIC Gratis (2 minutos)

1. Abre MetaMask
2. Click donde dice "Ethereum Mainnet" → Activa "Show test networks"
3. Selecciona "Polygon Mumbai"
4. Copia tu dirección (click en el nombre de la cuenta)
5. Ve a: https://faucet.polygon.technology/
6. Pega tu dirección
7. Click "Submit"
8. Espera 1 minuto
9. En MetaMask deberías ver ~0.2 MATIC

---

## 🎯 Paso 2: Abrir Remix IDE

1. Ve a: https://remix.ethereum.org
2. Verás un IDE (editor de código)
3. En el panel izquierdo, click en 📁 "File Explorer"

---

## 📋 Paso 3: Crear los Contratos (Copy/Paste)

### 3.1: Crear CasinoToken.sol

1. En Remix, click derecho en carpeta "contracts"
2. Click "New File"
3. Nombra: `CasinoToken.sol`
4. Pega este código:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CasinoToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;

    constructor(address initialOwner)
        ERC20("Casino Crypto", "CASC")
        Ownable(initialOwner)
    {
        _mint(initialOwner, MAX_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
```

### 3.2: Crear Casino.sol

1. New File → `Casino.sol`
2. Copia TODO el contenido de: `contracts/Casino.sol` (de GitHub)
3. Pégalo en Remix

### 3.3: Crear BaseGame.sol

1. New File → `BaseGame.sol`
2. Copia de: `contracts/BaseGame.sol`
3. Pégalo

### 3.4: Crear CoinFlip.sol

1. New File → `CoinFlip.sol`
2. Copia de: `contracts/games/CoinFlip.sol`
3. Pégalo

### 3.5: Crear Dice.sol

1. New File → `Dice.sol`
2. Copia de: `contracts/games/Dice.sol`

### 3.6: Crear Roulette.sol

1. New File → `Roulette.sol`
2. Copia de: `contracts/games/Roulette.sol`

---

## ⚙️ Paso 4: Compilar (1 click)

1. En Remix, click en el ícono 🔨 "Solidity Compiler" (panel izquierdo)
2. Selecciona Compiler: `0.8.20`
3. Click en "Compile CasinoToken.sol"
4. Click en "Compile Casino.sol"
5. Click en "Compile CoinFlip.sol"
6. Click en "Compile Dice.sol"
7. Click en "Compile Roulette.sol"

Deberías ver ✅ verdes en todos.

---

## 🚀 Paso 5: Desplegar (5 clicks)

### 5.1: Conectar MetaMask

1. Click en el ícono 🚀 "Deploy & Run" (panel izquierdo)
2. En "Environment" selecciona: **"Injected Provider - MetaMask"**
3. MetaMask se abrirá → Click "Connect"
4. Verifica que diga "Polygon Mumbai" y tu dirección

### 5.2: Desplegar CasinoToken

1. En "Contract" selecciona: `CasinoToken`
2. Al lado de "Deploy" verás un campo
3. Pega tu dirección de MetaMask (será el owner)
4. Click "Deploy"
5. MetaMask abrirá → Click "Confirm"
6. Espera 10 segundos
7. Abajo en "Deployed Contracts" verás el contrato
8. **COPIA Y GUARDA** la dirección (ej: 0xABC123...)

### 5.3: Desplegar Casino

1. En "Contract" selecciona: `Casino`
2. En el campo de deploy, pega estos parámetros separados por comas:

```
"TU_DIRECCION", 10000000000000000, 100, 200
```

Ejemplo real:
```
"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", 10000000000000000, 100, 200
```

3. En "VALUE" (arriba), pon: `10` y selecciona "Ether" (será el bankroll inicial)
4. Click "Deploy"
5. Confirm en MetaMask
6. **GUARDA** la dirección del Casino

### 5.4: Desplegar CoinFlip

1. Contract: `CoinFlip`
2. Parámetros:
```
"DIRECCION_CASINO", 10000000000000000, 1000000000000000000, "TU_DIRECCION"
```

Ejemplo:
```
"0xCasinoAddress", 10000000000000000, 1000000000000000000, "0xTuDireccion"
```

3. Deploy → Confirm
4. **GUARDA** dirección CoinFlip

### 5.5: Desplegar Dice

Mismo proceso con:
```
"DIRECCION_CASINO", 10000000000000000, 1000000000000000000, "TU_DIRECCION"
```

**GUARDA** dirección Dice

### 5.6: Desplegar Roulette

Mismo proceso con:
```
"DIRECCION_CASINO", 10000000000000000, 1000000000000000000, "TU_DIRECCION"
```

**GUARDA** dirección Roulette

---

## 🔐 Paso 6: Autorizar Juegos

Ahora hay que decirle al Casino que confíe en los juegos:

### 6.1: Autorizar CoinFlip

1. En "Deployed Contracts", click en Casino para expandirlo
2. Busca la función `authorizeGame`
3. Pega la dirección de CoinFlip
4. Click "authorizeGame"
5. Confirm en MetaMask

### 6.2: Autorizar Dice

Mismo proceso con dirección de Dice

### 6.3: Autorizar Roulette

Mismo proceso con dirección de Roulette

---

## ✅ ¡LISTO! Tus Contratos Están Desplegados

Deberías tener guardadas 5 direcciones:

```
CasinoToken: 0x...
Casino: 0x...
CoinFlip: 0x...
Dice: 0x...
Roulette: 0x...
```

---

## 🌐 Paso 7: Configurar Frontend

1. Ve a tu repositorio en GitHub
2. Abre el archivo: `frontend/src/config.js`
3. Click en el lápiz (editar)
4. Reemplaza las direcciones:

```javascript
export const CONTRACTS = {
  CASINO: "0xTuDireccionCasino",
  COINFLIP: "0xTuDireccionCoinFlip",
  DICE: "0xTuDireccionDice",
  ROULETTE: "0xTuDireccionRoulette",
};
```

5. Click "Commit changes"

---

## 🚀 Paso 8: Publicar en Vercel

1. Ve a: https://vercel.com
2. Sign up con GitHub
3. Click "Add New..." → "Project"
4. Selecciona tu repositorio CASCRYPTO
5. En "Root Directory" selecciona: `frontend`
6. Click "Deploy"
7. Espera 3 minutos
8. ¡LISTO! Te dará una URL

---

## 🎉 Tu Casino Está Público

URL: `https://tu-proyecto.vercel.app`

¡Compártela con quien quieras!

---

## 🔍 Verificar Contratos en PolygonScan

Para que el código sea visible públicamente:

1. Ve a: https://mumbai.polygonscan.com/
2. Pega la dirección de cada contrato
3. Click en la pestaña "Contract"
4. Click "Verify and Publish"
5. Sigue los pasos

Esto es opcional pero recomendado para transparencia.
