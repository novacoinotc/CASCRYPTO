# 🎰 Guía COMPLETA para Publicar tu Casino - SIN Saber Programar

Esta guía te llevará paso a paso desde CERO hasta tener tu casino funcionando en internet. No necesitas saber programar, solo seguir las instrucciones exactamente como se indican.

## ⏱️ Tiempo Total: 2-3 horas

---

## 📋 Parte 1: Preparar tu Computadora (30 minutos)

### Paso 1.1: Instalar Node.js

Node.js es el programa que ejecuta el código JavaScript.

1. Ve a: https://nodejs.org/
2. Descarga la versión "LTS" (Long Term Support)
3. Ejecuta el instalador
4. Click "Next" en todo hasta terminar
5. Para verificar que funcionó:
   - Windows: Abre "CMD" o "PowerShell"
   - Mac: Abre "Terminal"
   - Escribe: `node --version`
   - Deberías ver algo como: `v18.19.0`

### Paso 1.2: Instalar Git

Git es para descargar código de GitHub.

1. Ve a: https://git-scm.com/downloads
2. Descarga para tu sistema (Windows/Mac)
3. Instala (click Next en todo)
4. Para verificar:
   - Abre terminal/CMD
   - Escribe: `git --version`
   - Deberías ver: `git version 2.43.0` (o similar)

### Paso 1.3: Crear Cuenta en GitHub

Si ya tienes cuenta, salta este paso.

1. Ve a: https://github.com
2. Click "Sign Up"
3. Crea tu cuenta (gratis)
4. Verifica tu email

### Paso 1.4: Instalar MetaMask

MetaMask es tu billetera de criptomonedas.

1. Ve a: https://metamask.io
2. Click "Download"
3. Instala la extensión para tu navegador (Chrome/Firefox/Brave)
4. Abre MetaMask
5. Click "Create a new wallet"
6. **MUY IMPORTANTE:**
   - Guarda la frase secreta de 12 palabras
   - NUNCA la compartas con nadie
   - Guárdala en un lugar seguro (papel, no digital)

---

## 📥 Parte 2: Descargar tu Proyecto (10 minutos)

### Paso 2.1: Descargar el Código

1. Abre terminal/CMD
2. Ve a tu carpeta de documentos:
   ```bash
   cd Documents
   ```
3. Descarga el proyecto:
   ```bash
   git clone https://github.com/novacoinotc/CASCRYPTO.git
   ```
4. Entra a la carpeta:
   ```bash
   cd CASCRYPTO
   ```

### Paso 2.2: Instalar Dependencias

Esto descarga todas las librerías necesarias (puede tomar 5-10 minutos):

```bash
npm install
```

Verás muchos mensajes scrolleando. Es normal. Espera hasta que termine.

---

## 🔑 Parte 3: Configurar tu Wallet (15 minutos)

### Paso 3.1: Obtener tu Private Key

**⚠️ ADVERTENCIA:** La private key es como la contraseña de tu billetera. NUNCA la compartas.

1. Abre MetaMask
2. Click en los 3 puntos arriba
3. Click "Account details"
4. Click "Export Private Key"
5. Ingresa tu contraseña de MetaMask
6. Copia la private key (empieza con 0x...)

### Paso 3.2: Configurar el Archivo .env

1. En la carpeta CASCRYPTO, encuentra el archivo `.env.example`
2. Cópialo y renómbralo a `.env` (sin .example)
3. Abre `.env` con un editor de texto (Notepad, TextEdit, etc.)
4. Donde dice `PRIVATE_KEY=tu_private_key_aqui`
5. Pega tu private key así:
   ```
   PRIVATE_KEY=0x1234567890abcdef... (tu key aquí)
   ```
6. Guarda el archivo

**⚠️ NUNCA subas este archivo .env a internet o GitHub**

### Paso 3.3: Obtener Criptomonedas de Testnet (GRATIS)

Vamos a usar "Polygon Mumbai" que es una red de prueba (no cuesta dinero real).

1. Abre MetaMask
2. Click donde dice "Ethereum Mainnet" arriba
3. Click "Show test networks"
4. Actívalo (ON)
5. Selecciona "Polygon Mumbai"
6. Copia tu dirección (click en el nombre de tu cuenta arriba)
7. Ve a: https://faucet.polygon.technology/
8. Pega tu dirección
9. Click "Submit"
10. Espera 1-2 minutos
11. En MetaMask deberías ver "0.2 MATIC" (aproximadamente)

---

## 🚀 Parte 4: Desplegar los Contratos (20 minutos)

Los contratos son el "cerebro" del casino que vive en la blockchain.

### Paso 4.1: Compilar los Contratos

En tu terminal (dentro de la carpeta CASCRYPTO):

```bash
npm run compile
```

Deberías ver:
```
Compiled 6 Solidity files successfully
```

Si ves errores, verifica que seguiste todos los pasos anteriores.

### Paso 4.2: Desplegar en Polygon Mumbai

Este comando sube tus contratos a la blockchain:

```bash
npm run deploy:mumbai
```

Verás algo como:
```
🎰 Deploying CASCRYPTO Casino...

Deploying contracts with account: 0x...
Account balance: 0.2 MATIC

📝 Deploying CasinoToken...
✅ CasinoToken deployed to: 0xABC123...

🏛️  Deploying Casino...
✅ Casino deployed to: 0xDEF456...

🪙 Deploying CoinFlip...
✅ CoinFlip deployed to: 0xGHI789...

🎲 Deploying Dice...
✅ Dice deployed to: 0xJKL012...

🎡 Deploying Roulette...
✅ Roulette deployed to: 0xMNO345...

═══════════════════════════════════════════════════════
🎉 DEPLOYMENT COMPLETE! 🎉
═══════════════════════════════════════════════════════
```

**MUY IMPORTANTE:**
- Copia y guarda todas las direcciones (0xABC123...)
- Las necesitarás para el frontend
- Se guardan automáticamente en `deployments/`

---

## 🎨 Parte 5: Crear el Frontend (40 minutos)

El frontend es la página web donde la gente jugará.

### Paso 5.1: Crear el Proyecto Frontend

Vamos a crear una carpeta para el sitio web:

```bash
# Asegúrate de estar en la carpeta CASCRYPTO
cd frontend
```

Si no existe la carpeta, la crearemos ahora junto con todos los archivos necesarios.

### Paso 5.2: Configurar las Direcciones de los Contratos

1. Abre el archivo `frontend/src/config.js`
2. Pega las direcciones de tus contratos (las que copiaste antes):

```javascript
export const CONTRACTS = {
  CASINO: "0xDEF456...",      // Tu dirección del Casino
  COINFLIP: "0xGHI789...",    // Tu dirección del CoinFlip
  DICE: "0xJKL012...",        // Tu dirección del Dice
  ROULETTE: "0xMNO345...",    // Tu dirección del Roulette
};
```

3. Guarda el archivo

---

## 🌐 Parte 6: Publicar en Vercel (30 minutos)

Vercel es GRATIS y hospeda tu sitio web.

### Paso 6.1: Crear Cuenta en Vercel

1. Ve a: https://vercel.com
2. Click "Sign Up"
3. Usa "Continue with GitHub" (más fácil)
4. Autoriza Vercel a acceder a GitHub

### Paso 6.2: Subir tu Código a GitHub

1. Ve a: https://github.com
2. Click el botón "+" arriba a la derecha
3. Click "New repository"
4. Nombre: `mi-casino` (o el que quieras)
5. Selecciona "Private" (para que solo tú lo veas)
6. Click "Create repository"

7. En tu terminal (en la carpeta CASCRYPTO):

```bash
git add .
git commit -m "Mi casino completo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mi-casino.git
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### Paso 6.3: Conectar Vercel con GitHub

1. Ve a tu dashboard de Vercel
2. Click "Add New..." → "Project"
3. Click "Import" al lado de tu repositorio `mi-casino`
4. En "Framework Preset" selecciona "Create React App" o "Next.js" (depende de tu frontend)
5. En "Root Directory" pon: `frontend`
6. Click "Deploy"

Vercel empezará a construir tu sitio. Esto toma 2-5 minutos.

### Paso 6.4: ¡Tu Casino Está Publicado!

Cuando termine, verás:
```
🎉 Congratulations! Your project has been successfully deployed.
```

Vercel te dará una URL como:
```
https://mi-casino.vercel.app
```

**¡ESA ES TU PÁGINA WEB!**

Compártela con quien quieras. Cualquiera puede entrar y jugar.

---

## 🎮 Parte 7: Probar tu Casino (15 minutos)

### Paso 7.1: Conectar MetaMask

1. Abre tu sitio: `https://mi-casino.vercel.app`
2. Click "Connect Wallet"
3. MetaMask se abrirá
4. Click "Connect"
5. Ahora deberías ver tu dirección conectada

### Paso 7.2: Jugar CoinFlip

1. Ve a la sección "CoinFlip"
2. Elige: Heads o Tails
3. Escribe cuánto quieres apostar (ej: 0.1)
4. Click "Place Bet"
5. MetaMask pedirá confirmar
6. Click "Confirm"
7. Espera 5-10 segundos
8. ¡Verás si ganaste o perdiste!

### Paso 7.3: Probar otros Juegos

- **Dice:** Elige un número del 1-99
- **Roulette:** Elige número, color, o par/impar

---

## 💰 Parte 8: Pasar a Dinero Real (Mainnet)

**⚠️ LEE ESTO COMPLETO ANTES DE CONTINUAR:**

### Antes de Usar Dinero Real:

1. **Legal:**
   - Consulta con un abogado
   - Verifica las leyes de gambling en tu país
   - Puede necesitar licencias

2. **Seguridad:**
   - DEBES implementar Chainlink VRF (ver `docs/CHAINLINK_VRF.md`)
   - El sistema actual de random NO es seguro para dinero real
   - Contrata una auditoría de seguridad (~$5,000-$20,000 USD)

3. **Capital:**
   - Necesitas un bankroll inicial (mínimo $10,000-$50,000 USD en crypto)
   - Para pagar a los ganadores

### Si Decides Continuar:

1. Cambia en `hardhat.config.js`:
   - De `mumbai` a `polygon`

2. Obtén MATIC real:
   - Compra en Binance, Coinbase, Kraken
   - Envía a tu MetaMask

3. Despliega en mainnet:
   ```bash
   npm run deploy:polygon
   ```

4. Actualiza las direcciones en el frontend

5. Vuelve a desplegar en Vercel

**Costo estimado en Polygon Mainnet:**
- Deploy de contratos: ~$5-10 USD
- Cada apuesta: ~$0.01-$0.05 USD

---

## 🆘 Solución de Problemas

### "Command not found: npm"
- Reinstala Node.js
- Cierra y vuelve a abrir la terminal

### "MetaMask no se conecta"
- Verifica que estés en "Polygon Mumbai"
- Recarga la página
- Desconecta y vuelve a conectar

### "Insufficient funds"
- Necesitas más MATIC de testnet
- Usa el faucet: https://faucet.polygon.technology/

### "Transaction failed"
- Aumenta el gas limit
- Verifica que tengas suficiente MATIC
- Espera unos minutos y reintenta

### "Deployment failed"
- Verifica tu archivo `.env`
- Confirma que tu PRIVATE_KEY es correcta
- Asegúrate de tener MATIC en tu wallet

---

## 📞 ¿Necesitas Ayuda?

1. **Revisa los archivos de documentación:**
   - `README.md` - Resumen general
   - `QUICKSTART.md` - Guía rápida
   - `FAQ.md` - Preguntas frecuentes

2. **Videos tutoriales** (próximamente)

3. **Comunidad:**
   - GitHub Issues: https://github.com/novacoinotc/CASCRYPTO/issues
   - Discord (próximamente)

---

## ✅ Checklist Final

Antes de publicar a dinero real, verifica que hayas hecho:

- [ ] Implementado Chainlink VRF
- [ ] Contratado auditoría de seguridad
- [ ] Consultado con abogado sobre leyes
- [ ] Testeado TODO en testnet extensivamente
- [ ] Preparado bankroll suficiente ($10k+ USD)
- [ ] Configurado sistema de monitoreo
- [ ] Preparado equipo de soporte
- [ ] Creado Terms of Service
- [ ] Implementado KYC/AML si es necesario
- [ ] Configurado multisig para admin
- [ ] Plan de respuesta a emergencias

---

## 🎉 ¡Felicidades!

Has logrado crear y publicar un casino descentralizado desde cero, sin saber programar.

Ahora puedes:
- ✅ Jugar en testnet gratis
- ✅ Compartir tu sitio con amigos
- ✅ Aprender más sobre Web3
- ✅ Experimentar y modificar

**Recuerda:**
- Testnet = Gratis, para probar
- Mainnet = Dinero real, requiere TODO lo de seguridad y legal

---

## 📚 Siguientes Pasos Opcionales

1. **Personalizar el Diseño:**
   - Cambia colores en `frontend/src/styles`
   - Añade tu logo
   - Modifica textos

2. **Añadir Más Juegos:**
   - Blackjack
   - Slots
   - Poker

3. **Mejorar UX:**
   - Animaciones
   - Sonidos
   - Efectos visuales

4. **Marketing:**
   - Redes sociales
   - SEO
   - Anuncios

---

**¿Preguntas?** Revisa `FAQ.md` o abre un issue en GitHub.

**⚠️ DISCLAIMER LEGAL:**
Este software es educativo. El gambling online puede ser ilegal en tu jurisdicción. Usa bajo tu propio riesgo. Los creadores no son responsables del mal uso.

---

**¡Buena suerte con tu casino! 🎰🚀**
