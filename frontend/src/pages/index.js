import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORK } from '../config';
import { COINFLIP_ABI, DICE_ABI, ROULETTE_ABI, CASINO_ABI } from '../abis';

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('coinflip');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Por favor instala MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setBalance(ethers.formatEther(balance));

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== NETWORK.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${NETWORK.chainId.toString(16)}` }],
          });
        } catch (switchError) {
          alert(`Por favor cambia a ${NETWORK.name} en MetaMask`);
        }
      }

      setMessage('✅ Wallet conectado!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error conectando wallet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900 text-white relative overflow-hidden">
      {/* Efectos de fondo animados - Morado Neón */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Confetti cuando ganas */}
      {showConfetti && <Confetti />}

      {/* Header Mejorado - Morado Neón */}
      <header className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 p-6 shadow-2xl relative z-10 border-b-4 border-purple-400 glow-purple">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-6xl animate-bounce">🎰</div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                CASCRYPTO
              </h1>
              <p className="text-sm text-purple-200">🚀 Casino Descentralizado Web3</p>
            </div>
          </div>
          {!address ? (
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 px-8 py-4 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse glow-purple"
            >
              🔌 Conectar Wallet
            </button>
          ) : (
            <div className="bg-black bg-opacity-60 px-6 py-3 rounded-xl border-2 border-purple-400 glow-purple">
              <div className="text-sm text-purple-300">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <div className="font-bold text-2xl text-fuchsia-400">
                💰 {parseFloat(balance).toFixed(4)} ETH
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 relative z-10">
        {message && (
          <div className={`${
            message.includes('GANASTE') ? 'bg-gradient-to-r from-green-600 to-green-800 animate-bounce' :
            message.includes('Error') || message.includes('Perdiste') ? 'bg-gradient-to-r from-red-600 to-red-800' :
            'bg-gradient-to-r from-blue-600 to-blue-800'
          } p-6 rounded-xl mb-6 text-center text-2xl font-bold shadow-2xl border-2 border-white`}>
            {message}
          </div>
        )}

        {!address ? (
          <div className="text-center py-20">
            <div className="text-9xl mb-8 animate-bounce">🎲🎰🎡</div>
            <h2 className="text-6xl mb-6 font-black bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
              ¡Bienvenido!
            </h2>
            <p className="text-2xl opacity-75 mb-12 text-purple-300">Conecta tu wallet y gana en grande 💎</p>
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-600 px-12 py-6 rounded-2xl font-bold text-3xl shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse glow-purple"
            >
              🚀 Conectar MetaMask
            </button>
          </div>
        ) : (
          <>
            {/* Tabs Mejorados - Morado Neón */}
            <div className="flex gap-6 mb-8 justify-center flex-wrap">
              <button
                onClick={() => setActiveTab('coinflip')}
                className={`px-8 py-4 rounded-2xl font-bold text-xl transform transition-all duration-300 ${
                  activeTab === 'coinflip'
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 scale-110 shadow-2xl glow-purple border-2 border-purple-300'
                    : 'bg-gray-800 hover:bg-purple-900 hover:scale-105 border-2 border-gray-700'
                }`}
              >
                <div className="text-4xl mb-2">🪙</div>
                Coin Flip
              </button>
              <button
                onClick={() => setActiveTab('dice')}
                className={`px-8 py-4 rounded-2xl font-bold text-xl transform transition-all duration-300 ${
                  activeTab === 'dice'
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 scale-110 shadow-2xl glow-purple border-2 border-fuchsia-300'
                    : 'bg-gray-800 hover:bg-purple-900 hover:scale-105 border-2 border-gray-700'
                }`}
              >
                <div className="text-4xl mb-2">🎲</div>
                Dice
              </button>
              <button
                onClick={() => setActiveTab('roulette')}
                className={`px-8 py-4 rounded-2xl font-bold text-xl transform transition-all duration-300 ${
                  activeTab === 'roulette'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 scale-110 shadow-2xl glow-purple border-2 border-violet-300'
                    : 'bg-gray-800 hover:bg-purple-900 hover:scale-105 border-2 border-gray-700'
                }`}
              >
                <div className="text-4xl mb-2">🎡</div>
                Roulette
              </button>
            </div>

            {/* Game Components */}
            {activeTab === 'coinflip' && (
              <CoinFlipGame signer={signer} setMessage={setMessage} setLoading={setLoading} setShowConfetti={setShowConfetti} />
            )}
            {activeTab === 'dice' && (
              <DiceGame signer={signer} setMessage={setMessage} setLoading={setLoading} setShowConfetti={setShowConfetti} />
            )}
            {activeTab === 'roulette' && (
              <RouletteGame signer={signer} setMessage={setMessage} setLoading={setLoading} setShowConfetti={setShowConfetti} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center p-6 relative z-10 bg-black bg-opacity-50 mt-20 border-t-2 border-purple-600">
        <p className="text-purple-400 font-bold">💎 CASCRYPTO - Casino Descentralizado Web3 💎</p>
        <p className="text-sm mt-2 text-fuchsia-400">⚠️ Testnet Sepolia - No uses dinero real</p>
      </footer>
    </div>
  );
}

// Componente CoinFlip MEJORADO
function CoinFlipGame({ signer, setMessage, setLoading, setShowConfetti }) {
  const [choice, setChoice] = useState(0);
  const [amount, setAmount] = useState('0.01');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const placeBet = async () => {
    try {
      setLoading(true);
      setSpinning(true);
      setResult(null);
      setMessage('🪙 Lanzando la moneda...');

      const contract = new ethers.Contract(CONTRACTS.COINFLIP, COINFLIP_ABI, signer);

      const tx = await contract.placeBet(choice, {
        value: ethers.parseEther(amount)
      });

      setMessage('⏳ Esperando confirmación en blockchain...');
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'BetSettled';
        } catch {
          return false;
        }
      });

      setTimeout(() => {
        if (event) {
          const parsed = contract.interface.parseLog(event);
          const won = parsed.args.won;
          setResult(won ? 'win' : 'lose');

          if (won) {
            setMessage(`🎉💰 ¡GANASTE ${ethers.formatEther(parsed.args.payout)} ETH! 💰🎉`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          } else {
            setMessage(`😢 Perdiste ${amount} ETH. ¡Intenta de nuevo!`);
          }
        }
        setSpinning(false);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setSpinning(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-fuchsia-800 p-10 rounded-3xl shadow-2xl border-4 border-purple-400 max-w-2xl mx-auto glow-purple">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">🪙</div>
        <h2 className="text-4xl font-black text-purple-100">Coin Flip</h2>
        <p className="text-purple-200 mt-2">50/50 de probabilidad • Paga 1.98x</p>
      </div>

      {/* Animación de moneda girando */}
      {spinning && (
        <div className="text-center mb-8 bg-black bg-opacity-40 p-8 rounded-2xl">
          <div className="text-9xl animate-spin inline-block">🪙</div>
          <p className="text-2xl font-bold mt-4 animate-pulse text-fuchsia-300">Girando...</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block mb-4 text-xl font-bold text-purple-100">Elige tu lado:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setChoice(0)}
              className={`p-8 rounded-2xl font-bold text-2xl transform transition-all duration-300 ${
                choice === 0
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 scale-105 shadow-2xl glow-purple border-2 border-fuchsia-300'
                  : 'bg-gray-800 hover:bg-purple-900 hover:scale-105 border-2 border-gray-700'
              }`}
            >
              <div className="text-5xl mb-2">👑</div>
              HEADS
            </button>
            <button
              onClick={() => setChoice(1)}
              className={`p-8 rounded-2xl font-bold text-2xl transform transition-all duration-300 ${
                choice === 1
                  ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 scale-105 shadow-2xl glow-purple border-2 border-fuchsia-300'
                  : 'bg-gray-800 hover:bg-purple-900 hover:scale-105 border-2 border-gray-700'
              }`}
            >
              <div className="text-5xl mb-2">🦅</div>
              TAILS
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xl font-bold text-purple-100">Cantidad (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-2xl font-bold border-2 border-purple-400 focus:border-fuchsia-400 focus:outline-none"
            placeholder="0.01"
          />
          <p className="text-purple-200 mt-2">
            💰 Ganancia potencial: {(parseFloat(amount) * 1.98).toFixed(4)} ETH
          </p>
        </div>

        <button
          onClick={placeBet}
          disabled={spinning}
          className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-fuchsia-500 hover:from-fuchsia-600 hover:via-purple-700 hover:to-fuchsia-600 p-6 rounded-2xl font-black text-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
        >
          {spinning ? '🎲 Girando...' : `🚀 Apostar ${amount} ETH`}
        </button>
      </div>
    </div>
  );
}

// Componente Dice MEJORADO
function DiceGame({ signer, setMessage, setLoading, setShowConfetti }) {
  const [numberChosen, setNumberChosen] = useState(50);
  const [amount, setAmount] = useState('0.01');
  const [multiplier, setMultiplier] = useState('1.96');
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);

  useEffect(() => {
    const mult = ((10000 - 200) / numberChosen / 100).toFixed(2);
    setMultiplier(mult);
  }, [numberChosen]);

  const placeBet = async () => {
    try {
      setLoading(true);
      setRolling(true);
      setDiceResult(null);
      setMessage('🎲 Tirando los dados...');

      const contract = new ethers.Contract(CONTRACTS.DICE, DICE_ABI, signer);

      const tx = await contract.placeBet(numberChosen, {
        value: ethers.parseEther(amount)
      });

      setMessage('⏳ Esperando resultado...');
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'DiceRolled';
        } catch {
          return false;
        }
      });

      setTimeout(() => {
        if (event) {
          const parsed = contract.interface.parseLog(event);
          const resultNum = Number(parsed.args.resultNumber);
          setDiceResult(resultNum);

          if (parsed.args.won) {
            setMessage(`🎉 ¡GANASTE! Salió ${resultNum} ≤ ${numberChosen} • Premio: ${ethers.formatEther(parsed.args.payout)} ETH`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          } else {
            setMessage(`😢 Perdiste. Salió ${resultNum} > ${numberChosen}`);
          }
        }
        setRolling(false);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setRolling(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-fuchsia-900 to-purple-800 p-10 rounded-3xl shadow-2xl border-4 border-fuchsia-400 max-w-2xl mx-auto glow-purple">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">🎲</div>
        <h2 className="text-4xl font-black text-purple-100">Dice Game</h2>
        <p className="text-purple-200 mt-2">Elige tu probabilidad • Gana hasta 98x</p>
      </div>

      {/* Animación de dados rodando */}
      {rolling && (
        <div className="text-center mb-8 bg-black bg-opacity-40 p-8 rounded-2xl">
          <div className="text-9xl animate-bounce inline-block">🎲</div>
          <p className="text-3xl font-bold mt-4 animate-pulse text-fuchsia-300">Rodando...</p>
        </div>
      )}

      {diceResult !== null && !rolling && (
        <div className="text-center mb-8 bg-fuchsia-500 bg-opacity-20 p-6 rounded-2xl border-4 border-fuchsia-400 glow-purple">
          <p className="text-xl text-purple-100 mb-2">Resultado:</p>
          <p className="text-6xl font-black text-fuchsia-300">{diceResult}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-black bg-opacity-40 p-6 rounded-2xl border-2 border-purple-600">
          <label className="block mb-4 text-2xl font-bold text-purple-100">
            Tu número: {numberChosen}
          </label>
          <input
            type="range"
            min="1"
            max="99"
            value={numberChosen}
            onChange={(e) => setNumberChosen(Number(e.target.value))}
            className="w-full h-4 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${numberChosen}%, #ec4899 ${numberChosen}%, #ec4899 100%)`
            }}
          />
          <div className="flex justify-between text-lg text-purple-200 mt-3">
            <span>🎯 Probabilidad: {numberChosen}%</span>
            <span>💰 Multiplier: {multiplier}x</span>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xl font-bold text-purple-100">Cantidad (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-2xl font-bold border-2 border-purple-400 focus:border-fuchsia-400 focus:outline-none"
            placeholder="0.01"
          />
          <p className="text-purple-200 mt-2 text-lg">
            💰 Ganancia potencial: {(parseFloat(amount) * parseFloat(multiplier)).toFixed(4)} ETH
          </p>
        </div>

        <button
          onClick={placeBet}
          disabled={rolling}
          className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-fuchsia-500 hover:from-fuchsia-600 hover:via-purple-700 hover:to-fuchsia-600 p-6 rounded-2xl font-black text-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 glow-purple"
        >
          {rolling ? '🎲 Rodando...' : `🚀 Tirar Dados`}
        </button>
      </div>
    </div>
  );
}

// Componente Roulette MEJORADO
function RouletteGame({ signer, setMessage, setLoading, setShowConfetti }) {
  const [betType, setBetType] = useState(1);
  const [amount, setAmount] = useState('0.01');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const betTypes = [
    { id: 0, name: '🎯 Straight (Número específico)', payout: '35x', emoji: '🎯' },
    { id: 1, name: '🔴 RED (Rojo)', payout: '2x', emoji: '🔴' },
    { id: 2, name: '⚫ BLACK (Negro)', payout: '2x', emoji: '⚫' },
    { id: 3, name: '2️⃣ EVEN (Par)', payout: '2x', emoji: '2️⃣' },
    { id: 4, name: '1️⃣ ODD (Impar)', payout: '2x', emoji: '1️⃣' },
    { id: 5, name: '⬇️ LOW (1-18)', payout: '2x', emoji: '⬇️' },
    { id: 6, name: '⬆️ HIGH (19-36)', payout: '2x', emoji: '⬆️' },
  ];

  const placeBet = async () => {
    try {
      setLoading(true);
      setSpinning(true);
      setResult(null);
      setMessage('🎡 Girando la ruleta...');

      const contract = new ethers.Contract(CONTRACTS.ROULETTE, ROULETTE_ABI, signer);

      const tx = await contract.placeBet(betType, 0, {
        value: ethers.parseEther(amount)
      });

      setMessage('⏳ La bola está girando...');
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'RouletteSpun';
        } catch {
          return false;
        }
      });

      setTimeout(() => {
        if (event) {
          const parsed = contract.interface.parseLog(event);
          const resultNum = Number(parsed.args.resultNumber);
          setResult(resultNum);

          if (parsed.args.won) {
            setMessage(`🎉 ¡GANASTE! Salió ${resultNum} • Premio: ${ethers.formatEther(parsed.args.payout)} ETH 💰`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          } else {
            setMessage(`😢 Perdiste. Salió ${resultNum}`);
          }
        }
        setSpinning(false);
        setLoading(false);
      }, 3000);

    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setSpinning(false);
      setLoading(false);
    }
  };

  const selectedBet = betTypes.find(b => b.id === betType);

  return (
    <div className="bg-gradient-to-br from-violet-900 to-purple-800 p-10 rounded-3xl shadow-2xl border-4 border-violet-400 max-w-2xl mx-auto glow-purple">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-spin-slow">🎡</div>
        <h2 className="text-4xl font-black text-purple-100">Roulette</h2>
        <p className="text-purple-200 mt-2">Ruleta Europea • 0-36</p>
      </div>

      {/* Animación de ruleta girando */}
      {spinning && (
        <div className="text-center mb-8 bg-black bg-opacity-40 p-8 rounded-2xl">
          <div className="text-9xl animate-spin inline-block">🎡</div>
          <p className="text-3xl font-bold mt-4 animate-pulse text-violet-300">La bola está girando...</p>
        </div>
      )}

      {result !== null && !spinning && (
        <div className="text-center mb-8 bg-violet-500 bg-opacity-20 p-6 rounded-2xl border-4 border-violet-400 glow-purple">
          <p className="text-xl text-purple-100 mb-2">¡Salió el número!</p>
          <p className="text-7xl font-black text-violet-300">{result}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block mb-3 text-xl font-bold text-purple-100">Tipo de Apuesta:</label>
          <select
            value={betType}
            onChange={(e) => setBetType(Number(e.target.value))}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-xl font-bold border-2 border-purple-400 focus:border-violet-400 focus:outline-none"
          >
            {betTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name} - Paga {type.payout}
              </option>
            ))}
          </select>
          {selectedBet && (
            <div className="mt-3 p-4 bg-purple-800 bg-opacity-50 rounded-xl text-center border-2 border-purple-600">
              <span className="text-4xl">{selectedBet.emoji}</span>
              <span className="ml-3 text-xl font-bold text-purple-100">
                Paga {selectedBet.payout}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 text-xl font-bold text-purple-100">Cantidad (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-2xl font-bold border-2 border-purple-400 focus:border-violet-400 focus:outline-none"
            placeholder="0.01"
          />
        </div>

        <button
          onClick={placeBet}
          disabled={spinning}
          className="w-full bg-gradient-to-r from-violet-500 via-purple-600 to-violet-500 hover:from-violet-600 hover:via-purple-700 hover:to-violet-600 p-6 rounded-2xl font-black text-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 glow-purple"
        >
          {spinning ? '🎡 Girando...' : `🚀 Girar Ruleta`}
        </button>
      </div>
    </div>
  );
}

// Componente Confetti
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {['💰', '🎉', '⭐', '💎', '🏆'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
}
