import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

export default function CrashGame({ signer, setMessage, setLoading, setShowConfetti }) {
  const [amount, setAmount] = useState('0.01');
  const [multiplier, setMultiplier] = useState(1.00);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(null);
  const [autoCashout, setAutoCashout] = useState('2.00');
  const intervalRef = useRef(null);

  // Simulación del crash (en producción esto vendría del smart contract)
  const startGame = async () => {
    try {
      setLoading(true);
      setMessage('🚀 Iniciando vuelo...');

      // Aquí irían las interacciones con el smart contract
      // Por ahora simulamos el juego

      setIsPlaying(true);
      setHasCrashed(false);
      setCashoutMultiplier(null);
      setMultiplier(1.00);
      setLoading(false);

      // Punto de crash aleatorio entre 1.01x y 10x
      const crashPoint = 1.01 + Math.random() * 9;
      let currentMultiplier = 1.00;

      intervalRef.current = setInterval(() => {
        currentMultiplier += 0.01;
        setMultiplier(parseFloat(currentMultiplier.toFixed(2)));

        // Auto cashout
        if (parseFloat(autoCashout) > 0 && currentMultiplier >= parseFloat(autoCashout)) {
          cashOut(currentMultiplier);
        }

        // Crash!
        if (currentMultiplier >= crashPoint) {
          clearInterval(intervalRef.current);
          setHasCrashed(true);
          setIsPlaying(false);
          setMessage(`💥 CRASH en ${crashPoint.toFixed(2)}x! Perdiste ${amount} ETH`);
        }
      }, 100);

    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  const cashOut = (mult) => {
    if (!isPlaying) return;

    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCashoutMultiplier(mult || multiplier);

    const winAmount = (parseFloat(amount) * (mult || multiplier)).toFixed(4);
    setMessage(`🎉 ¡CASHOUT! ${(mult || multiplier).toFixed(2)}x • Ganaste ${winAmount} ETH 💰`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900 to-fuchsia-800 p-10 rounded-3xl shadow-2xl border-4 border-purple-400 max-w-4xl mx-auto glow-purple">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">💎</div>
        <h2 className="text-4xl font-black text-purple-100">Crash Game</h2>
        <p className="text-purple-200 mt-2">¡Retira antes del crash! 🚀</p>
      </div>

      {/* Gráfica del multiplicador */}
      <div className="bg-black bg-opacity-60 p-8 rounded-2xl mb-6 border-2 border-purple-600 min-h-[300px] flex items-center justify-center">
        {!isPlaying && !hasCrashed && !cashoutMultiplier && (
          <div className="text-center">
            <p className="text-6xl mb-4">🚀</p>
            <p className="text-2xl text-purple-300">Esperando despegue...</p>
          </div>
        )}

        {isPlaying && (
          <div className="text-center">
            <div className="text-9xl font-black mb-4 animate-pulse text-fuchsia-300 glow-purple">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-3xl text-purple-200 animate-bounce">
              🚀 VOLANDO...
            </div>
          </div>
        )}

        {hasCrashed && (
          <div className="text-center">
            <div className="text-9xl font-black mb-4 text-red-500">
              💥
            </div>
            <div className="text-4xl text-red-400">
              CRASHED at {multiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {cashoutMultiplier && !isPlaying && (
          <div className="text-center">
            <div className="text-9xl font-black mb-4 text-green-400 animate-pulse">
              {cashoutMultiplier.toFixed(2)}x
            </div>
            <div className="text-4xl text-green-300">
              ✅ CASHED OUT!
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2 text-xl font-bold text-purple-100">Cantidad (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPlaying}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-2xl font-bold border-2 border-purple-400 focus:border-fuchsia-400 focus:outline-none disabled:opacity-50"
            placeholder="0.01"
          />
          <p className="text-purple-200 mt-2 text-sm">
            💰 Ganancia potencial @2x: {(parseFloat(amount) * 2).toFixed(4)} ETH
          </p>
        </div>

        <div>
          <label className="block mb-2 text-xl font-bold text-purple-100">Auto Cashout (opcional):</label>
          <input
            type="number"
            step="0.1"
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            disabled={isPlaying}
            className="w-full p-4 rounded-xl bg-black bg-opacity-50 text-white text-2xl font-bold border-2 border-purple-400 focus:border-fuchsia-400 focus:outline-none disabled:opacity-50"
            placeholder="2.00"
          />
          <p className="text-purple-200 mt-2 text-sm">
            🎯 Auto retiro en {autoCashout}x
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 gap-4">
        {!isPlaying ? (
          <button
            onClick={startGame}
            disabled={loading}
            className="col-span-2 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-fuchsia-500 hover:from-fuchsia-600 hover:via-purple-700 hover:to-fuchsia-600 p-6 rounded-2xl font-black text-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 glow-purple"
          >
            🚀 Apostar {amount} ETH
          </button>
        ) : (
          <button
            onClick={() => cashOut()}
            className="col-span-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 p-6 rounded-2xl font-black text-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            💰 CASHOUT @ {multiplier.toFixed(2)}x
          </button>
        )}
      </div>

      {/* Historial reciente */}
      <div className="mt-6 bg-black bg-opacity-40 p-4 rounded-xl border-2 border-purple-600">
        <h3 className="text-lg font-bold text-purple-200 mb-3">🎯 Últimos Crashes:</h3>
        <div className="flex gap-2 flex-wrap">
          {[2.43, 1.05, 8.92, 1.32, 3.67, 1.89, 12.45, 1.11, 5.23, 2.87].map((crash, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-lg font-bold ${
                crash >= 2 ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {crash.toFixed(2)}x
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-center text-sm text-purple-300">
        <p>⚠️ Demo mode - En producción usará smart contract con Chainlink VRF</p>
      </div>
    </div>
  );
}
