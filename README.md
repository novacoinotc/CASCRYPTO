# 🎰 CASCRYPTO - Casino Descentralizado Web3

Casino virtual completamente descentralizado construido sobre blockchain, con transparencia total y pagos instantáneos.

## 🌟 Características

- **100% Descentralizado**: Todo el código ejecutándose en blockchain
- **Provably Fair**: Cada apuesta es verificable en la blockchain
- **Pagos Instantáneos**: Sin intermediarios, pagos automáticos vía smart contracts
- **Múltiples Juegos**: Dados, Ruleta, Coin Flip, Blackjack
- **Transparencia Total**: Código open-source y auditable
- **Sin KYC**: Juega anónimamente con tu wallet

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Web3)                   │
│  - Interfaz de usuario                                       │
│  - Conexión con wallets (MetaMask, WalletConnect)           │
│  - Visualización de juegos en tiempo real                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Web3.js / ethers.js
                     │
┌────────────────────▼────────────────────────────────────────┐
│              SMART CONTRACTS (Solidity)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CasinoToken  │  │ Casino Core  │  │   Games      │      │
│  │ (ERC-20)     │  │ (Bankroll)   │  │ - Dice       │      │
│  │              │  │              │  │ - Roulette   │      │
│  └──────────────┘  └──────────────┘  │ - CoinFlip   │      │
│                                       │ - Blackjack  │      │
│  ┌──────────────┐  ┌──────────────┐  └──────────────┘      │
│  │   RNG/VRF    │  │  Governance  │                         │
│  │ (Chainlink)  │  │              │                         │
│  └──────────────┘  └──────────────┘                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
│  - Ethereum / Polygon / BSC                                  │
│  - Almacenamiento inmutable                                  │
│  - Ejecución de smart contracts                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Smart Contracts
- **Solidity ^0.8.20**: Lenguaje de programación
- **Hardhat**: Framework de desarrollo
- **OpenZeppelin**: Librería de contratos seguros
- **Chainlink VRF**: Números aleatorios verificables

### Frontend
- **React 18**: Framework UI
- **Next.js 14**: SSR y routing
- **ethers.js v6**: Interacción con blockchain
- **Wagmi**: React hooks para Ethereum
- **RainbowKit**: Conexión de wallets
- **TailwindCSS**: Estilos

### Blockchain
- **Polygon (Testnet: Mumbai)**: Red principal (bajas comisiones)
- **Ethereum (Testnet: Sepolia)**: Alternativa (más segura)

## 📁 Estructura del Proyecto

```
CASCRYPTO/
├── contracts/               # Smart Contracts
│   ├── CasinoToken.sol     # Token ERC-20 del casino
│   ├── Casino.sol          # Contrato principal
│   ├── games/              # Contratos de juegos
│   │   ├── Dice.sol
│   │   ├── Roulette.sol
│   │   ├── CoinFlip.sol
│   │   └── Blackjack.sol
│   ├── libraries/          # Librerías auxiliares
│   │   ├── RandomNumber.sol
│   │   └── SafeMath.sol
│   └── interfaces/         # Interfaces
│       └── ICasino.sol
├── scripts/                # Scripts de deployment
│   ├── deploy.js
│   └── verify.js
├── test/                   # Tests de contratos
│   ├── Casino.test.js
│   └── games/
├── frontend/               # Aplicación Web3
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas
│   │   ├── utils/         # Utilidades
│   │   └── contracts/     # ABIs
│   ├── public/
│   └── package.json
├── hardhat.config.js       # Configuración Hardhat
├── package.json
└── README.md
```

## 🎮 Juegos Disponibles

### 1. 🎲 Dice (Dados)
- Apuesta en un número del 1-100
- Elige tu probabilidad de ganar
- Multiplicador dinámico según probabilidad
- House edge: 1-2%

### 2. 🎡 Roulette (Ruleta)
- Ruleta europea (0-36)
- Apuestas: Número, Color, Par/Impar, Docenas
- Pagos estándar de ruleta
- House edge: 2.7%

### 3. 💰 Coin Flip (Cara o Cruz)
- Simple: Heads o Tails
- 50/50 probabilidad
- Multiplicador 1.98x
- House edge: 1%

### 4. 🃏 Blackjack
- Juego clásico contra la casa
- Reglas estándar
- House edge: 0.5%

## 🔐 Seguridad

- ✅ **Auditoría de contratos**: Código revisado y testeado
- ✅ **Randomness verificable**: Chainlink VRF para números aleatorios
- ✅ **OpenZeppelin**: Contratos estándar de la industria
- ✅ **Reentrancy protection**: Guards en todas las funciones críticas
- ✅ **Access control**: Roles y permisos bien definidos
- ✅ **Emergency pause**: Sistema de pausa de emergencia

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js >= 18.x
- npm o yarn
- Wallet con criptomonedas de testnet

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/novacoinotc/CASCRYPTO.git
cd CASCRYPTO

# Instalar dependencias
npm install

# Compilar contratos
npm run compile

# Ejecutar tests
npm run test

# Desplegar en testnet
npm run deploy:testnet

# Iniciar frontend
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

### Testnet (Desarrollo)
```bash
# Polygon Mumbai Testnet
npm run deploy:mumbai

# Ethereum Sepolia Testnet
npm run deploy:sepolia
```

### Mainnet (Producción)
```bash
# ⚠️ REQUIERE AUDITORÍA DE SEGURIDAD PREVIA
npm run deploy:polygon
npm run deploy:ethereum
```

## 📊 Economics (Tokenomics)

- **Casino Token (CASC)**: Token ERC-20 nativo
- **Bankroll**: Pool de liquidez para pagos
- **House Edge**: 1-2% según el juego
- **Staking**: Los holders pueden stakear y recibir parte de las ganancias

## 🎯 Roadmap

### Fase 1 - MVP (Q4 2024)
- [x] Arquitectura y documentación
- [ ] Smart contracts básicos
- [ ] Juegos: Dice, CoinFlip, Roulette
- [ ] Frontend básico
- [ ] Deploy en testnet

### Fase 2 - Beta (Q1 2025)
- [ ] Blackjack y más juegos
- [ ] Sistema de staking
- [ ] Auditoría de seguridad
- [ ] Beta pública en testnet

### Fase 3 - Mainnet (Q2 2025)
- [ ] Deploy en Polygon Mainnet
- [ ] Marketing y lanzamiento
- [ ] Programa de liquidez
- [ ] Mobile app (React Native)

### Fase 4 - Expansión (Q3 2025)
- [ ] Más juegos (Slots, Poker)
- [ ] Multi-chain (Ethereum, BSC, Arbitrum)
- [ ] NFT rewards
- [ ] DAO governance

## ⚖️ Legal y Compliance

⚠️ **IMPORTANTE**: Las leyes sobre gambling online varían por jurisdicción. Este proyecto es para fines educativos. Antes de lanzar en producción:

1. Consulta con un abogado especializado en crypto/gambling
2. Verifica las regulaciones locales
3. Considera implementar geo-blocking si es necesario
4. Evalúa si necesitas licencias de gambling

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

- Website: [cascrypto.io](https://cascrypto.io)
- Twitter: [@cascrypto](https://twitter.com/cascrypto)
- Discord: [Join our community](https://discord.gg/cascrypto)

## ⚠️ Disclaimer

Este software se proporciona "tal cual", sin garantías de ningún tipo. El gambling puede ser adictivo y causar problemas financieros. Juega responsablemente y solo con dinero que puedas permitirte perder.

---

**Built with ❤️ on the Blockchain**
