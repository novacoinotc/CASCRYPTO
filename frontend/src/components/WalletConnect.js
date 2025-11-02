import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NETWORK } from '../config';

export default function WalletConnect({ onConnect }) {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getWalletOptions = () => {
    if (!isMounted) {
      return [
        { name: 'MetaMask', icon: '🦊', description: 'La wallet más popular', color: 'from-orange-500 to-orange-700', available: false, comingSoon: false },
        { name: 'WalletConnect', icon: '🔗', description: 'Conecta 100+ wallets', color: 'from-blue-500 to-blue-700', available: false, comingSoon: true },
        { name: 'Coinbase Wallet', icon: '🔵', description: 'Wallet de Coinbase', color: 'from-blue-600 to-indigo-700', available: false, comingSoon: true },
        { name: 'Trust Wallet', icon: '🛡️', description: 'Wallet móvil segura', color: 'from-cyan-500 to-blue-600', available: false, comingSoon: true },
        { name: 'Rabby', icon: '🐰', description: 'Wallet DeFi avanzada', color: 'from-purple-500 to-pink-600', available: false, comingSoon: true },
        { name: 'OKX Wallet', icon: '⭕', description: 'Wallet de OKX', color: 'from-gray-700 to-gray-900', available: false, comingSoon: true },
      ];
    }

    return [
      {
        name: 'MetaMask',
        icon: '🦊',
        description: 'La wallet más popular',
        color: 'from-orange-500 to-orange-700',
        available: !!window.ethereum,
        comingSoon: false
      },
      {
        name: 'WalletConnect',
        icon: '🔗',
        description: 'Conecta 100+ wallets',
        color: 'from-blue-500 to-blue-700',
        available: false,
        comingSoon: true
      },
      {
        name: 'Coinbase Wallet',
        icon: '🔵',
        description: 'Wallet de Coinbase',
        color: 'from-blue-600 to-indigo-700',
        available: !!window.coinbaseWalletExtension,
        comingSoon: !window.coinbaseWalletExtension
      },
      {
        name: 'Trust Wallet',
        icon: '🛡️',
        description: 'Wallet móvil segura',
        color: 'from-cyan-500 to-blue-600',
        available: false,
        comingSoon: true
      },
      {
        name: 'Rabby',
        icon: '🐰',
        description: 'Wallet DeFi avanzada',
        color: 'from-purple-500 to-pink-600',
        available: !!window.ethereum?.isRabby,
        comingSoon: !window.ethereum?.isRabby
      },
      {
        name: 'OKX Wallet',
        icon: '⭕',
        description: 'Wallet de OKX',
        color: 'from-gray-700 to-gray-900',
        available: !!window.okxwallet,
        comingSoon: !window.okxwallet
      },
    ];
  };

  const walletOptions = getWalletOptions();

  const connectWallet = async (walletName) => {
    try {
      setConnecting(true);

      if (walletName === 'MetaMask') {
        if (!window.ethereum) {
          alert('Por favor instala MetaMask!');
          window.open('https://metamask.io/download/', '_blank');
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

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
            return;
          }
        }

        onConnect({
          provider,
          signer,
          address,
          balance: ethers.formatEther(balance),
          walletName
        });

        setShowModal(false);
      } else if (walletName === 'Coinbase Wallet') {
        // Similar implementación para Coinbase Wallet
        alert('Coinbase Wallet próximamente!');
      } else {
        alert(`${walletName} próximamente!`);
      }

    } catch (error) {
      console.error('Error conectando wallet:', error);
      alert('Error conectando wallet: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 px-8 py-4 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all duration-200 glow-purple"
      >
        🔌 Conectar Wallet
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-black p-8 rounded-3xl border-4 border-purple-500 max-w-2xl w-full glow-purple">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-purple-100">Conectar Wallet</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-4xl text-purple-300 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => wallet.available && connectWallet(wallet.name)}
                  disabled={!wallet.available || connecting}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300
                    ${wallet.available
                      ? `bg-gradient-to-r ${wallet.color} hover:scale-105 border-purple-400 cursor-pointer`
                      : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {wallet.comingSoon && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                  <div className="text-5xl mb-3">{wallet.icon}</div>
                  <div className="text-xl font-bold text-white mb-1">{wallet.name}</div>
                  <div className="text-sm text-gray-300">{wallet.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-purple-300">
              <p>🔒 Tu wallet nunca saldrá de tu control</p>
              <p className="mt-1">Conectamos de forma segura sin acceso a tus fondos</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
