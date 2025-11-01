# 🎰 CASCRYPTO Frontend

Frontend del casino descentralizado construido con Next.js y ethers.js.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Direcciones de Contratos

Edita `src/config.js` y pega las direcciones de tus contratos desplegados:

```javascript
export const CONTRACTS = {
  CASINO: "0xABC123...",      // Tu dirección del Casino
  COINFLIP: "0xDEF456...",    // Tu dirección del CoinFlip
  DICE: "0xGHI789...",        // Tu dirección del Dice
  ROULETTE: "0xJKL012...",    // Tu dirección del Roulette
};
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Construir para Producción

```bash
npm run build
npm run start
```

## 📦 Desplegar en Vercel

### Método 1: Desde la Web

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta `frontend` como root directory
4. Click "Deploy"

### Método 2: Desde la CLI

```bash
npm install -g vercel
vercel
```

## 🎮 Características

- ✅ Conexión con MetaMask
- ✅ Detección automática de red
- ✅ 3 juegos: CoinFlip, Dice, Roulette
- ✅ Interfaz responsiva
- ✅ Animaciones y feedback en tiempo real
- ✅ Cálculo de probabilidades y payouts

## 🛠️ Stack Tecnológico

- **Next.js 14** - React framework
- **ethers.js v6** - Interacción con blockchain
- **Tailwind CSS** - Estilos
- **MetaMask** - Wallet connection

## 📝 Estructura del Proyecto

```
frontend/
├── src/
│   ├── pages/
│   │   ├── index.js       # Página principal
│   │   └── _app.js        # App wrapper
│   ├── styles/
│   │   └── globals.css    # Estilos globales
│   ├── config.js          # Configuración de contratos
│   └── abis.js            # ABIs de los contratos
├── public/                # Archivos estáticos
├── package.json
└── next.config.js
```

## 🔧 Configuración

### Cambiar a Polygon Mainnet

Edita `src/config.js`:

```javascript
export const NETWORK = {
  chainId: 137,
  name: "Polygon Mainnet",
  rpcUrl: "https://polygon-rpc.com",
  blockExplorer: "https://polygonscan.com",
};
```

**⚠️ Asegúrate de haber implementado Chainlink VRF antes de usar mainnet!**

### Personalizar Estilos

Los colores principales están en `src/pages/index.js`:

```javascript
// Cambiar gradiente del fondo
bg-gradient-to-br from-purple-900 via-blue-900 to-black

// Cambiar color de botones
bg-green-600 hover:bg-green-700
```

## 📱 Responsive

El frontend es completamente responsive y funciona en:
- 📱 Mobile
- 💻 Desktop
- 🖥️ Tablet

## 🐛 Problemas Comunes

### "Please install MetaMask"
- Instala MetaMask: https://metamask.io

### "Wrong network"
- Cambia a Polygon Mumbai en MetaMask
- O el frontend lo hará automáticamente

### "Transaction failed"
- Verifica que tengas suficiente MATIC
- Aumenta el gas limit
- Verifica que las direcciones de contratos sean correctas

### No se ven los juegos
- Verifica que hayas conectado tu wallet
- Verifica que estés en la red correcta
- Abre la consola del navegador (F12) para ver errores

## 🔒 Seguridad

- ✅ Nunca compartas tu private key
- ✅ El .env no debe subirse a GitHub
- ✅ Verifica siempre las transacciones en MetaMask
- ✅ Usa testnet primero

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [ethers.js Docs](https://docs.ethers.org/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MetaMask Docs](https://docs.metamask.io/)

## 🤝 Contribuir

Mejoras bienvenidas! Por favor abre un issue o pull request.

## 📄 Licencia

MIT License - ver archivo LICENSE en la raíz del proyecto.

---

**¡Buena suerte con tu casino! 🎰**
