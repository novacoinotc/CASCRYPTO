import { useState, useEffect } from 'react';

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState([]);

  // Simulación de ganancias en tiempo real
  useEffect(() => {
    const generateNotification = () => {
      const usernames = [
        'CryptoKing', 'LuckyWhale', 'DiceGod', 'MegaWinner', 'CasinoQueen',
        'BetMaster', 'HighRoller', 'DiamondHands', 'MoonShot', 'GigaChad',
        'AlphaPlayer', 'DegenGambler', 'LuckyDev', 'WhaleHunter', 'CryptoLord'
      ];

      const games = [
        { name: 'Crash', emoji: '💎' },
        { name: 'Coin Flip', emoji: '🪙' },
        { name: 'Dice', emoji: '🎲' },
        { name: 'Roulette', emoji: '🎡' },
        { name: 'Plinko', emoji: '🎯' },
      ];

      const username = usernames[Math.floor(Math.random() * usernames.length)];
      const game = games[Math.floor(Math.random() * games.length)];
      const amount = (Math.random() * 5 + 0.1).toFixed(3);
      const multiplier = (Math.random() * 10 + 1.5).toFixed(2);

      const notification = {
        id: Date.now(),
        username,
        game: game.name,
        emoji: game.emoji,
        amount,
        multiplier,
        timestamp: new Date()
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    };

    // Generar notificación cada 3-8 segundos
    const interval = setInterval(() => {
      generateNotification();
    }, Math.random() * 5000 + 3000);

    // Generar algunas iniciales
    for (let i = 0; i < 5; i++) {
      setTimeout(generateNotification, i * 1000);
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900 to-black p-6 rounded-2xl border-2 border-purple-600 glow-purple max-h-[600px] overflow-hidden">
      <h3 className="text-2xl font-black text-purple-200 mb-4 flex items-center gap-2">
        <span className="animate-pulse">🔔</span>
        Ganancias en Vivo
      </h3>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            className="bg-black bg-opacity-50 p-4 rounded-xl border border-purple-500 transform transition-all duration-500 hover:scale-105 hover:border-fuchsia-400"
            style={{
              animation: `slideIn 0.5s ease-out ${index * 0.1}s`,
              opacity: 1 - (index * 0.1)
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{notif.emoji}</span>
                <div>
                  <p className="text-fuchsia-400 font-bold">@{notif.username}</p>
                  <p className="text-sm text-purple-300">{notif.game}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-lg">
                  +{notif.amount} ETH
                </p>
                <p className="text-xs text-purple-400">
                  {notif.multiplier}x
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8 text-purple-400">
          <p className="text-4xl mb-2">🎰</p>
          <p>Esperando ganancias...</p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
