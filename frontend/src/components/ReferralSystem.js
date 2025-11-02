import { useState, useEffect } from 'react';

export default function ReferralSystem({ address }) {
  const [referralCode, setReferralCode] = useState('');
  const [origin, setOrigin] = useState('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: '0.000',
    pendingRewards: '0.000'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Generar código de referido basado en la dirección
  useEffect(() => {
    if (address && !referralCode) {
      const code = address.slice(2, 8).toUpperCase();
      setReferralCode(code);
    }
  }, [address, referralCode]);

  const copyReferralLink = () => {
    const link = `${origin}?ref=${referralCode}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      alert('🔗 Link copiado! Compártelo para ganar comisiones.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-fuchsia-900 p-8 rounded-3xl shadow-2xl border-4 border-purple-400 glow-purple">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">🤝</div>
        <h2 className="text-3xl font-black text-purple-100">Sistema de Referidos</h2>
        <p className="text-purple-200 mt-2">Gana 5% de las pérdidas de tus referidos!</p>
      </div>

      {/* Código de referido */}
      <div className="bg-black bg-opacity-50 p-6 rounded-2xl mb-6 border-2 border-purple-500">
        <label className="block text-sm font-bold text-purple-300 mb-2">Tu Código de Referido:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode || 'Conecta tu wallet'}
            readOnly
            className="flex-1 p-4 rounded-xl bg-purple-950 text-white text-2xl font-mono font-bold border-2 border-purple-600 text-center"
          />
          <button
            onClick={copyReferralLink}
            disabled={!referralCode}
            className="px-6 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 rounded-xl font-bold text-lg disabled:opacity-50 glow-purple"
          >
            📋 Copiar Link
          </button>
        </div>
        {referralCode && origin && (
          <p className="text-xs text-purple-400 mt-2 text-center">
            {origin}?ref={referralCode}
          </p>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black bg-opacity-40 p-4 rounded-xl border-2 border-purple-600 text-center">
          <p className="text-purple-300 text-sm mb-1">Total Referidos</p>
          <p className="text-3xl font-black text-fuchsia-400">{stats.totalReferrals}</p>
        </div>
        <div className="bg-black bg-opacity-40 p-4 rounded-xl border-2 border-purple-600 text-center">
          <p className="text-purple-300 text-sm mb-1">Activos</p>
          <p className="text-3xl font-black text-green-400">{stats.activeReferrals}</p>
        </div>
        <div className="bg-black bg-opacity-40 p-4 rounded-xl border-2 border-purple-600 text-center">
          <p className="text-purple-300 text-sm mb-1">Total Ganado</p>
          <p className="text-2xl font-black text-yellow-400">{stats.totalEarned} ETH</p>
        </div>
        <div className="bg-black bg-opacity-40 p-4 rounded-xl border-2 border-purple-600 text-center">
          <p className="text-purple-300 text-sm mb-1">Pendiente</p>
          <p className="text-2xl font-black text-purple-400">{stats.pendingRewards} ETH</p>
        </div>
      </div>

      {/* Niveles de comisión */}
      <div className="bg-black bg-opacity-40 p-6 rounded-2xl border-2 border-purple-600">
        <h3 className="text-xl font-bold text-purple-200 mb-4">💰 Niveles de Comisión:</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-900 bg-opacity-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <span className="font-bold text-purple-100">Nivel 1</span>
            </div>
            <span className="text-green-400 font-black text-lg">5%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-900 bg-opacity-30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥👥</span>
              <span className="font-bold text-purple-100">Nivel 2</span>
            </div>
            <span className="text-green-400 font-black text-lg">2%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-900 bg-opacity-20 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥👥👥</span>
              <span className="font-bold text-purple-100">Nivel 3</span>
            </div>
            <span className="text-green-400 font-black text-lg">1%</span>
          </div>
        </div>
      </div>

      {/* Bonos especiales */}
      <div className="mt-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 p-6 rounded-2xl text-center">
        <h3 className="text-xl font-black text-white mb-3">🎁 Bonos Especiales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-black bg-opacity-30 p-3 rounded-lg">
            <p className="text-yellow-300 font-bold mb-1">🥉 10 refs</p>
            <p className="text-white">+50 USDT</p>
          </div>
          <div className="bg-black bg-opacity-30 p-3 rounded-lg">
            <p className="text-yellow-300 font-bold mb-1">🥈 50 refs</p>
            <p className="text-white">+300 USDT</p>
          </div>
          <div className="bg-black bg-opacity-30 p-3 rounded-lg">
            <p className="text-yellow-300 font-bold mb-1">🥇 100 refs</p>
            <p className="text-white">+1,000 USDT</p>
          </div>
          <div className="bg-black bg-opacity-30 p-3 rounded-lg">
            <p className="text-yellow-300 font-bold mb-1">💎 500 refs</p>
            <p className="text-white">+10k + VIP</p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="mt-6 text-center">
        <button
          onClick={copyReferralLink}
          disabled={!referralCode}
          className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 px-8 py-4 rounded-2xl font-black text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
        >
          🚀 Compartir y Ganar
        </button>
      </div>
    </div>
  );
}
