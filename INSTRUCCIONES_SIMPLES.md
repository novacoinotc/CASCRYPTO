# 🎰 INSTRUCCIONES SIMPLES - Tu Casino en 30 Minutos

## 🎯 Qué Vas a Hacer

1. Conseguir criptomonedas gratis (5 min)
2. Desplegar contratos con Remix (10 min)
3. Publicar sitio web en Vercel (10 min)
4. ¡Jugar! (5 min)

**TOTAL: 30 minutos**

---

## ✅ PARTE 1: Preparación (5 minutos)

### 1.1: Instalar MetaMask

1. Ve a: https://metamask.io/download/
2. Click "Install MetaMask for Chrome" (o tu navegador)
3. Click "Añadir a Chrome"
4. Click "Crear una cartera"
5. Acepta términos
6. Crea una contraseña fuerte
7. **MUY IMPORTANTE:** Guarda las 12 palabras en papel
8. Confirma las palabras
9. ¡Listo!

### 1.2: Cambiar a Polygon Mumbai (Red de Prueba)

1. Abre MetaMask
2. Click donde dice "Ethereum Mainnet" (arriba)
3. Click "Show test networks" (abajo)
4. Activa el switch
5. Ahora selecciona "Polygon Mumbai"

### 1.3: Obtener MATIC Gratis

1. En MetaMask, click en tu nombre (arriba)
2. Se copiará tu dirección
3. Ve a: https://faucet.polygon.technology/
4. Pega tu dirección
5. Selecciona "Mumbai" y "MATIC Token"
6. Click "Submit"
7. Espera 1-2 minutos
8. En MetaMask verás ~0.5 MATIC

---

## 🚀 PARTE 2: Desplegar Contratos con Remix (15 minutos)

### 2.1: Abrir Remix

1. Ve a: https://remix.ethereum.org
2. Click "Accept" en el mensaje que aparece
3. Ya tienes el editor de código abierto

### 2.2: Conectar MetaMask

1. En el panel izquierdo, click en el ícono 🚀 "Deploy & run transactions"
2. En "ENVIRONMENT", selecciona: **"Injected Provider - MetaMask"**
3. MetaMask se abrirá → Click "Connect"
4. Click "Next"
5. Click "Connect"
6. Deberías ver tu dirección abajo

### 2.3: Desplegar CasinoToken

**Crear el archivo:**
1. En panel izquierdo, click 📁 "File explorer"
2. Click derecho en carpeta "contracts" → "New File"
3. Nombra: `CasinoToken.sol`
4. Pega este código (COMPLETO):

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

**Compilar:**
1. Click en ícono 🔨 "Solidity compiler"
2. Compiler: selecciona `0.8.20`
3. Click "Compile CasinoToken.sol"
4. Verás ✅ verde

**Desplegar:**
1. Click en 🚀 "Deploy & run"
2. En "CONTRACT", selecciona: `CasinoToken`
3. Al lado del botón naranja "Deploy", verás un campo
4. Pega TU dirección de MetaMask (cópiala de MetaMask)
5. Ejemplo: `"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"`
6. Click "Deploy"
7. MetaMask abrirá → Click "Confirm"
8. Espera 10 segundos
9. Abajo en "Deployed Contracts" verás el contrato
10. **COPIA LA DIRECCIÓN** (click en el ícono 📋)
11. **GUÁRDALA** en una nota como: `Token: 0x...`

### 2.4: Desplegar Casino

**Ir a GitHub y copiar código:**
1. Nueva pestaña: https://github.com/novacoinotc/CASCRYPTO
2. Abre: `contracts/Casino.sol`
3. Click "Raw"
4. Selecciona TODO (Ctrl+A o Cmd+A)
5. Copia (Ctrl+C o Cmd+C)

**En Remix:**
1. New File → `Casino.sol`
2. Pega el código
3. Click 🔨 Compiler
4. Compile Casino.sol (✅)

**Desplegar:**
1. Click 🚀 Deploy
2. CONTRACT: `Casino`
3. En el campo de deploy pega (REEMPLAZA con tu dirección):

```
"TU_DIRECCION_AQUI", 10000000000000000, 100, 200
```

Ejemplo REAL:
```
"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", 10000000000000000, 100, 200
```

4. **IMPORTANTE:** En "VALUE" (arriba del botón Deploy):
   - Escribe: `10`
   - Selecciona: "Ether" (o "MATIC")
5. Click "Deploy"
6. Confirm en MetaMask
7. Espera 10 segundos
8. **GUARDA** la dirección: `Casino: 0x...`

### 2.5: Desplegar CoinFlip

**Copiar código:**
1. En GitHub: `contracts/games/CoinFlip.sol` → Raw → Copiar todo

**Copiar BaseGame primero:**
1. `contracts/BaseGame.sol` → Raw → Copiar
2. En Remix: New File → `BaseGame.sol` → Pegar
3. Compile

**Ahora CoinFlip:**
1. Remix: New File → `CoinFlip.sol` → Pegar
2. Compile CoinFlip.sol

**Desplegar:**
1. CONTRACT: `CoinFlip`
2. Parámetros (REEMPLAZA):

```
"DIRECCION_CASINO", 10000000000000000, 1000000000000000000, "TU_DIRECCION"
```

Ejemplo:
```
"0xABC123Casino", 10000000000000000, 1000000000000000000, "0x742d35TuDireccion"
```

3. Deploy → Confirm
4. **GUARDA**: `CoinFlip: 0x...`

### 2.6: Desplegar Dice

1. GitHub: `contracts/games/Dice.sol` → Raw → Copiar
2. Remix: New File → `Dice.sol` → Pegar
3. Compile
4. Deploy con MISMOS parámetros que CoinFlip (pero dirección Casino)
5. **GUARDA**: `Dice: 0x...`

### 2.7: Desplegar Roulette

1. GitHub: `contracts/games/Roulette.sol` → Raw → Copiar
2. Remix: New File → `Roulette.sol` → Pegar
3. Compile
4. Deploy con MISMOS parámetros
5. **GUARDA**: `Roulette: 0x...`

### 2.8: Autorizar Juegos (IMPORTANTE)

El Casino necesita confiar en los juegos:

**CoinFlip:**
1. En "Deployed Contracts", click en "Casino" (expandir)
2. Busca función `authorizeGame`
3. Pega dirección de CoinFlip
4. Click "authorizeGame"
5. Confirm en MetaMask

**Dice:**
- Mismo proceso con dirección de Dice

**Roulette:**
- Mismo proceso con dirección de Roulette

---

## 📝 RESUMEN - Tus Direcciones

Deberías tener:

```
Casino: 0x...
CoinFlip: 0x...
Dice: 0x...
Roulette: 0x...
```

---

## 🌐 PARTE 3: Publicar en Vercel (10 minutos)

### 3.1: Configurar Frontend

1. Ve a GitHub: https://github.com/novacoinotc/CASCRYPTO
2. Navega a: `frontend/src/config.js`
3. Click en el lápiz ✏️ (editar)
4. Reemplaza las direcciones con LAS TUYAS:

```javascript
export const CONTRACTS = {
  CASINO: "0xTuCasinoAqui",
  COINFLIP: "0xTuCoinFlipAqui",
  DICE: "0xTuDiceAqui",
  ROULETTE: "0xTuRouletteAqui",
};
```

5. Scroll abajo
6. Click "Commit changes"
7. Click "Commit changes" de nuevo

### 3.2: Crear Cuenta en Vercel

1. Ve a: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Autoriza Vercel
4. Ya tienes cuenta

### 3.3: Desplegar

1. En Vercel, click "Add New..." → "Project"
2. Click "Import" en tu repositorio CASCRYPTO
3. En "Root Directory" click "Edit"
4. Escribe: `frontend`
5. Click "Continue"
6. Click "Deploy"
7. Espera 3-5 minutos
8. ¡LISTO!

### 3.4: Tu URL

Vercel te dará una URL como:

```
https://cascrypto-abc123.vercel.app
```

**¡ESA ES TU PÁGINA WEB!**

---

## 🎮 PARTE 4: ¡Jugar! (5 minutos)

1. Abre tu URL de Vercel
2. Click "Conectar Wallet"
3. Confirm en MetaMask
4. Elige un juego (CoinFlip, Dice, Roulette)
5. Haz una apuesta
6. ¡Espera el resultado!

---

## 🎉 ¡FELICIDADES!

Acabas de crear y publicar un casino descentralizado completo.

**Comparte tu URL con:**
- Amigos
- Familia
- Redes sociales

Todos pueden jugar con criptomonedas de testnet (gratis).

---

## ⚠️ IMPORTANTE

**Esto es TESTNET:**
- Usa criptomonedas falsas (gratis)
- Solo para probar y aprender
- NO es dinero real

**Para usar dinero real:**
- Necesitas implementar Chainlink VRF
- Auditoría de seguridad ($5,000+)
- Consultar abogado
- Capital mínimo $10,000+
- **NO lo hagas sin ayuda profesional**

---

## 🆘 ¿Problemas?

**MetaMask no conecta:**
- Recarga la página
- Prueba en modo incógnito

**Transacción falla:**
- Verifica que tengas MATIC
- Aumenta gas limit en MetaMask

**Sitio no carga:**
- Espera 5 minutos más
- Vercel puede tardar en desplegar

**No puedo compilar:**
- Verifica que el código esté completo
- Intenta cambiar compiler a `0.8.19` o `0.8.21`

---

## 📊 Ver tus Contratos

Para ver tus contratos desplegados:

1. Ve a: https://mumbai.polygonscan.com/
2. Pega cualquier dirección
3. Verás todas las transacciones

---

**¡Disfruta tu casino! 🎰🚀**
