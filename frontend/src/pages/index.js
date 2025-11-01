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

  // Conectar wallet
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

      // Verificar red
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
    } catch (error) {
      console.error(error);
      setMessage('❌ Error conectando wallet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">🎰 CASCRYPTO Casino</h1>
          {!address ? (
            <button
              onClick={connectWallet}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold"
            >
              Conectar Wallet
            </button>
          ) : (
            <div className="text-right">
              <div className="text-sm opacity-75">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <div className="font-bold">{parseFloat(balance).toFixed(4)} MATIC</div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {message && (
          <div className="bg-blue-600 bg-opacity-50 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        {!address ? (
          <div className="text-center py-20">
            <h2 className="text-4xl mb-4">Bienvenido al Casino Descentralizado</h2>
            <p className="text-xl opacity-75 mb-8">Conecta tu wallet para empezar a jugar</p>
            <button
              onClick={connectWallet}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-bold text-xl"
            >
              Conectar MetaMask
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('coinflip')}
                className={`px-6 py-3 rounded-lg font-bold ${
                  activeTab === 'coinflip'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🪙 Coin Flip
              </button>
              <button
                onClick={() => setActiveTab('dice')}
                className={`px-6 py-3 rounded-lg font-bold ${
                  activeTab === 'dice'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🎲 Dice
              </button>
              <button
                onClick={() => setActiveTab('roulette')}
                className={`px-6 py-3 rounded-lg font-bold ${
                  activeTab === 'roulette'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🎡 Roulette
              </button>
            </div>

            {/* Game Components */}
            {activeTab === 'coinflip' && (
              <CoinFlipGame signer={signer} setMessage={setMessage} setLoading={setLoading} />
            )}
            {activeTab === 'dice' && (
              <DiceGame signer={signer} setMessage={setMessage} setLoading={setLoading} />
            )}
            {activeTab === 'roulette' && (
              <RouletteGame signer={signer} setMessage={setMessage} setLoading={setLoading} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center p-6 opacity-50">
        <p>CASCRYPTO - Casino Descentralizado en Web3</p>
        <p className="text-sm mt-2">⚠️ Esto es testnet. No uses dinero real.</p>
      </footer>
    </div>
  );
}

// Componente CoinFlip
function CoinFlipGame({ signer, setMessage, setLoading }) {
  const [choice, setChoice] = useState(0); // 0 = HEADS, 1 = TAILS
  const [amount, setAmount] = useState('0.1');

  const placeBet = async () => {
    try {
      setLoading(true);
      setMessage('⏳ Colocando apuesta...');

      const contract = new ethers.Contract(CONTRACTS.COINFLIP, COINFLIP_ABI, signer);

      const tx = await contract.placeBet(choice, {
        value: ethers.parseEther(amount)
      });

      setMessage('⏳ Esperando confirmación...');
      const receipt = await tx.wait();

      // Buscar evento BetSettled
      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'BetSettled';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        if (parsed.args.won) {
          setMessage(`🎉 ¡GANASTE! +${ethers.formatEther(parsed.args.payout)} MATIC`);
        } else {
          setMessage(`😢 Perdiste -${amount} MATIC. ¡Intenta de nuevo!`);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">🪙 Coin Flip</h2>
      <p className="mb-4 opacity-75">Elige Cara o Cruz. 50% de probabilidad. Payout: 1.98x</p>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Elige:</label>
          <div className="flex gap-4">
            <button
              onClick={() => setChoice(0)}
              className={`flex-1 p-4 rounded-lg font-bold ${
                choice === 0 ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              🪙 HEADS (Cara)
            </button>
            <button
              onClick={() => setChoice(1)}
              className={`flex-1 p-4 rounded-lg font-bold ${
                choice === 1 ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              🪙 TAILS (Cruz)
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2">Cantidad (MATIC):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
            placeholder="0.1"
          />
        </div>

        <button
          onClick={placeBet}
          className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold text-xl"
        >
          Apostar {amount} MATIC
        </button>
      </div>
    </div>
  );
}

// Componente Dice
function DiceGame({ signer, setMessage, setLoading }) {
  const [numberChosen, setNumberChosen] = useState(50);
  const [amount, setAmount] = useState('0.1');
  const [multiplier, setMultiplier] = useState('1.96');

  useEffect(() => {
    // Calcular multiplier
    const mult = ((10000 - 200) / numberChosen / 100).toFixed(2);
    setMultiplier(mult);
  }, [numberChosen]);

  const placeBet = async () => {
    try {
      setLoading(true);
      setMessage('⏳ Tirando los dados...');

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

      if (event) {
        const parsed = contract.interface.parseLog(event);
        if (parsed.args.won) {
          setMessage(`🎉 ¡GANASTE! Número: ${parsed.args.resultNumber}. Premio: +${ethers.formatEther(parsed.args.payout)} MATIC`);
        } else {
          setMessage(`😢 Perdiste. Número: ${parsed.args.resultNumber}. -${amount} MATIC`);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">🎲 Dice</h2>
      <p className="mb-4 opacity-75">Elige un número del 1-99. Si el dado cae ≤ tu número, ganas!</p>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Número (1-99): {numberChosen}</label>
          <input
            type="range"
            min="1"
            max="99"
            value={numberChosen}
            onChange={(e) => setNumberChosen(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm opacity-75">
            <span>Probabilidad: {numberChosen}%</span>
            <span>Multiplier: {multiplier}x</span>
          </div>
        </div>

        <div>
          <label className="block mb-2">Cantidad (MATIC):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
            placeholder="0.1"
          />
          <p className="text-sm opacity-75 mt-1">
            Ganancia potencial: {(amount * multiplier).toFixed(4)} MATIC
          </p>
        </div>

        <button
          onClick={placeBet}
          className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold text-xl"
        >
          Tirar Dados
        </button>
      </div>
    </div>
  );
}

// Componente Roulette
function RouletteGame({ signer, setMessage, setLoading }) {
  const [betType, setBetType] = useState(1); // 1 = RED
  const [amount, setAmount] = useState('0.1');

  const betTypes = [
    { id: 0, name: 'Straight (Número)', payout: '35x' },
    { id: 1, name: 'RED (Rojo)', payout: '2x' },
    { id: 2, name: 'BLACK (Negro)', payout: '2x' },
    { id: 3, name: 'EVEN (Par)', payout: '2x' },
    { id: 4, name: 'ODD (Impar)', payout: '2x' },
    { id: 5, name: 'LOW (1-18)', payout: '2x' },
    { id: 6, name: 'HIGH (19-36)', payout: '2x' },
  ];

  const placeBet = async () => {
    try {
      setLoading(true);
      setMessage('⏳ Girando la ruleta...');

      const contract = new ethers.Contract(CONTRACTS.ROULETTE, ROULETTE_ABI, signer);

      const tx = await contract.placeBet(betType, 0, {
        value: ethers.parseEther(amount)
      });

      setMessage('⏳ Esperando resultado...');
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          return contract.interface.parseLog(log).name === 'RouletteSpun';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        if (parsed.args.won) {
          setMessage(`🎉 ¡GANASTE! Número: ${parsed.args.resultNumber}. Premio: +${ethers.formatEther(parsed.args.payout)} MATIC`);
        } else {
          setMessage(`😢 Perdiste. Número: ${parsed.args.resultNumber}. -${amount} MATIC`);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">🎡 Roulette</h2>
      <p className="mb-4 opacity-75">Ruleta Europea (0-36)</p>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Tipo de Apuesta:</label>
          <select
            value={betType}
            onChange={(e) => setBetType(Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
          >
            {betTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name} - Paga {type.payout}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Cantidad (MATIC):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white"
            placeholder="0.1"
          />
        </div>

        <button
          onClick={placeBet}
          className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-lg font-bold text-xl"
        >
          Girar Ruleta
        </button>
      </div>
    </div>
  );
}
