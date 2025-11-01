# ❓ Preguntas Frecuentes (FAQ)

## General

### ¿Qué es CASCRYPTO?

CASCRYPTO es un casino descentralizado construido sobre blockchain (Web3) que utiliza smart contracts para proporcionar juegos de azar transparentes y verificables. Todo el código se ejecuta en la blockchain, lo que significa que es imposible hacer trampa y todos los resultados son auditables.

### ¿Es legal?

La legalidad del gambling online varía según tu jurisdicción. Este proyecto es para fines educativos. **Debes consultar con un abogado especializado** antes de lanzar un casino en producción. En muchos países necesitarás licencias específicas.

### ¿Es seguro?

Los contratos están diseñados siguiendo las mejores prácticas de seguridad:
- ✅ OpenZeppelin para contratos estándar
- ✅ ReentrancyGuard en todas las funciones críticas
- ✅ Access control con roles
- ✅ Sistema de pausa para emergencias

**Sin embargo**, antes de usar en mainnet con dinero real **DEBES**:
1. Realizar una auditoría de seguridad profesional
2. Implementar Chainlink VRF (no usar el RNG de desarrollo)
3. Hacer testing extensivo
4. Comenzar con límites bajos

### ¿Cuánto cuesta desplegar?

| Red | Costo de Deploy | Costo por Apuesta |
|-----|-----------------|-------------------|
| Polygon Mumbai (Testnet) | GRATIS | GRATIS |
| Polygon Mainnet | ~$5-10 | ~$0.01-0.05 |
| Ethereum Sepolia (Testnet) | GRATIS | GRATIS |
| Ethereum Mainnet | ~$500-1000 | ~$5-20 |

**Recomendación**: Usa Polygon para costos bajos.

## Técnico

### ¿Qué blockchain debería usar?

**Para comenzar (Testnet):**
- Polygon Mumbai: Rápido, gratis, fácil de usar

**Para producción (Mainnet):**
- **Polygon**: Mejor opción (rápido, barato, seguro)
- Ethereum: Más seguro pero muy caro
- BSC: Económico pero menos descentralizado
- Arbitrum/Optimism: Buen balance

### ¿Por qué no usar el RNG incluido en producción?

El generador de números aleatorios incluido usa `block.timestamp` y `block.prevrandao`, que pueden ser manipulados por mineros. Para producción **DEBES** usar Chainlink VRF, que proporciona números verdaderamente aleatorios y verificables.

Ver `docs/CHAINLINK_VRF.md` para más información.

### ¿Cómo funciona el bankroll?

El bankroll es el pool de fondos que el casino usa para pagar premios. Funciona así:

1. El casino se despliega con un bankroll inicial
2. Liquidity providers pueden añadir fondos
3. Cuando los jugadores pierden, el dinero va al bankroll
4. Cuando los jugadores ganan, se paga del bankroll
5. Los LPs pueden retirar su liquidez más ganancias

### ¿Qué es el house edge?

El house edge es la ventaja matemática del casino. En CASCRYPTO es del 2% por defecto. Esto significa:

- Si apuestas 1 ETH muchas veces, en promedio perderás 0.02 ETH por cada ETH apostado
- El casino gana 2% en promedio a largo plazo
- Es más bajo que casinos tradicionales (5-10%)

### ¿Cómo se calcula el payout?

```
Payout = Bet Amount × Multiplier

Multiplier = (100% - House Edge) / Probability

Ejemplos:
- CoinFlip (50% chance): 1.98x
- Dice (elegir 50): 1.96x
- Dice (elegir 10): 9.8x
- Roulette straight: 35x
```

### ¿Puedo añadir más juegos?

¡Sí! Todos los juegos heredan de `BaseGame.sol`. Para añadir un nuevo juego:

1. Crea un nuevo contrato en `contracts/games/`
2. Hereda de `BaseGame`
3. Implementa la lógica del juego
4. Despliega y autoriza en el Casino
5. Conecta con el frontend

Ejemplos de juegos que puedes añadir:
- Blackjack
- Slots
- Poker
- Plinko
- Crash

### ¿Cómo funcionan las apuestas asíncronas con VRF?

Con Chainlink VRF, las apuestas son asíncronas:

1. Usuario llama `placeBet()` → Se crea la apuesta
2. Contrato solicita número random a Chainlink
3. Usuario ve "Spinning..." en la interfaz
4. Chainlink responde después de 1-2 bloques
5. Contrato recibe el número y procesa resultado
6. Frontend detecta evento y muestra resultado

Total: ~30-60 segundos en Polygon, ~2-3 minutos en Ethereum.

## Económico

### ¿Cómo gana dinero el casino?

El casino gana a través del house edge. Por ejemplo:

- 1000 jugadores apuestan 1 ETH cada uno = 1000 ETH en apuestas
- El casino paga ~980 ETH en premios
- El casino gana ~20 ETH (2% house edge)

A largo plazo, el casino siempre gana el porcentaje del house edge.

### ¿Puedo ganar dinero como liquidity provider?

Sí, los LPs reciben una parte de las ganancias del casino. Sin embargo:

- ⚠️ Existe riesgo de pérdida temporal si el casino tiene mala suerte
- ⚠️ Necesitas bloquear liquidez por tiempo
- ✅ A largo plazo, el house edge garantiza ganancias
- ✅ Puedes retirar en cualquier momento (si hay liquidez)

### ¿Qué pasa si el casino no tiene fondos para pagar?

Los contratos verifican que haya fondos suficientes antes de aceptar apuestas. Si una apuesta potencialmente podría exceder el bankroll, es rechazada automáticamente.

La apuesta máxima es típicamente 1% del bankroll para minimizar este riesgo.

## Desarrollo

### ¿Cómo empiezo?

Ver `QUICKSTART.md` para una guía paso a paso de 15 minutos.

Resumen:
```bash
git clone https://github.com/novacoinotc/CASCRYPTO.git
cd CASCRYPTO
npm install
npm run compile
npm run test
npm run deploy:mumbai
```

### ¿Necesito conocimientos de Solidity?

Para usar el casino tal cual, no. Pero para modificarlo o añadir juegos, sí necesitas:

- Solidity básico-intermedio
- Hardhat
- JavaScript/TypeScript
- Conceptos de blockchain

Recursos recomendados:
- https://soliditylang.org/
- https://cryptozombies.io/
- https://hardhat.org/tutorial

### ¿Cómo debuggeo los contratos?

```javascript
// En tests
console.log("Value:", value.toString());

// En contratos
emit Debug(value); // Crea un evento Debug

// Con Hardhat console
npx hardhat console --network mumbai

// Ver eventos
const receipt = await tx.wait();
console.log(receipt.logs);

// Gas usado
console.log("Gas used:", receipt.gasUsed.toString());
```

### ¿Cómo optimizo el gas?

- ✅ Usa `uint256` en lugar de `uint8/uint16/uint128`
- ✅ Pack variables en storage slots
- ✅ Usa `immutable` y `constant` cuando sea posible
- ✅ Evita loops con length variable
- ✅ Usa eventos en lugar de storage cuando sea posible
- ✅ Batch múltiples operaciones

Ver `ARCHITECTURE.md` para más tips.

## Frontend

### ¿Viene con frontend?

Actualmente incluye solo los smart contracts. El frontend está en desarrollo.

Puedes construir tu propio frontend con:
- React + ethers.js
- Next.js + Wagmi
- Vue.js + web3.js

### ¿Cómo conecto con MetaMask?

```javascript
// Conectar wallet
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();

// Conectar con contrato
const coinFlip = new ethers.Contract(
  COINFLIP_ADDRESS,
  COINFLIP_ABI,
  signer
);

// Hacer apuesta
const tx = await coinFlip.placeBet(0, {
  value: ethers.parseEther("0.1")
});
await tx.wait();
```

### ¿Cómo escucho eventos en tiempo real?

```javascript
// Escuchar evento específico
coinFlip.on("BetSettled", (betId, player, won, payout) => {
  console.log(`Bet ${betId}: ${won ? "WON" : "LOST"}`);
});

// Escuchar una vez
coinFlip.once("BetSettled", (betId, player, won, payout) => {
  // Se ejecuta solo una vez
});

// Filtrar eventos
const filter = coinFlip.filters.BetSettled(null, userAddress);
const events = await coinFlip.queryFilter(filter, fromBlock, toBlock);
```

## Mainnet

### ¿Estoy listo para mainnet?

Solo debes ir a mainnet si:

- ✅ Has testeado extensivamente en testnet
- ✅ Has implementado Chainlink VRF
- ✅ Has realizado auditoría de seguridad profesional
- ✅ Has verificado las leyes locales
- ✅ Tienes un plan de respuesta a incidentes
- ✅ Tienes liquidez suficiente (mínimo 100 ETH en Polygon)
- ✅ Has configurado monitoring y alertas

### ¿Qué checklist de seguridad debo seguir?

Antes de mainnet:

**Contratos:**
- [ ] Auditoría de seguridad profesional
- [ ] Implementar Chainlink VRF
- [ ] Testing con >90% coverage
- [ ] Configurar multisig para admin
- [ ] Implementar timelock para cambios críticos
- [ ] Plan de actualización con proxy pattern (opcional)

**Operacional:**
- [ ] Monitoring 24/7 con alertas
- [ ] Plan de respuesta a incidentes
- [ ] Insurance fund para casos extremos
- [ ] Documentación completa
- [ ] Equipo de soporte

**Legal:**
- [ ] Consultar abogado especializado
- [ ] Obtener licencias necesarias
- [ ] Implementar KYC/AML si requerido
- [ ] Terms of Service y Privacy Policy
- [ ] Geo-blocking si necesario

### ¿Cuánta liquidez necesito?

Depende del volumen esperado:

**Pequeño** (hobby):
- 10-50 ETH en Polygon (~$20k-100k)
- Límites: Min 0.01 ETH, Max 0.1 ETH

**Mediano** (semi-profesional):
- 100-500 ETH (~$200k-1M)
- Límites: Min 0.01 ETH, Max 1 ETH

**Grande** (profesional):
- 1000+ ETH (~$2M+)
- Límites: Min 0.1 ETH, Max 10 ETH

## Soporte

### ¿Dónde puedo obtener ayuda?

- 📖 **Documentación**: Lee `README.md`, `ARCHITECTURE.md`, `QUICKSTART.md`
- 🐛 **Issues**: https://github.com/novacoinotc/CASCRYPTO/issues
- 💬 **Discord**: [Próximamente]
- 📧 **Email**: [Próximamente]

### ¿Puedo contribuir?

¡Por supuesto! Aceptamos:
- 🐛 Bug reports
- ✨ Feature requests
- 📝 Mejoras a la documentación
- 💻 Pull requests

Ver `CONTRIBUTING.md` para guidelines.

### ¿Ofrecen servicios de desarrollo?

Este es un proyecto open-source y educativo. Para servicios profesionales de desarrollo de casinos Web3, considera contratar:
- Desarrolladores Solidity con experiencia
- Empresas de auditoría (CertiK, OpenZeppelin, etc.)
- Consultores legales especializados en crypto

---

## ¿Más preguntas?

Si tu pregunta no está aquí, por favor:
1. Busca en los issues existentes
2. Lee la documentación completa
3. Abre un nuevo issue en GitHub

¡Buena suerte con tu casino descentralizado! 🎰
