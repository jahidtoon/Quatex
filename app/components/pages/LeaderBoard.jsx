import React from 'react';

const leaderboardData = [
  { name: 'Ogu...', amount: 30000 },
  { name: 'Anas Ali', amount: 30000 },
  { name: 'TECHNIC...', amount: 27297.9 },
  { name: 'Candle S...', amount: 24240 },
  { name: '#63685...', amount: 21445.6 },
  { name: '#637281...', amount: 16794.04 },
  { name: 'Bishnoi29', amount: 15449.19 },
  { name: 'RAMYA', amount: 13964.71 },
  { name: '#63982...', amount: 11718 },
  { name: 'SUDARS...', amount: 11592.19 },
  { name: 'ghatin v...', amount: 8520 },
  { name: '...', amount: 8495 },
  // ...add up to 20
];

const LeaderBoard = () => (
  <div className="bg-[#181c2b] w-full min-h-screen p-8 flex flex-col items-center font-sans">
    <div className="w-full max-w-2xl">
      <div className="bg-[#23283a] rounded-xl shadow-lg p-6 mb-8 flex flex-col gap-2 border border-[#2a3142]">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          <span className="text-white font-semibold text-base">Your position:</span>
          <span className="text-secondary text-xs ml-auto">75293</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-400 font-bold text-lg">$0.00</span>
        </div>
        <button className="mt-1 text-blue-400 text-xs flex items-center gap-1 hover:underline">
          <i className="fas fa-question-circle" /> How does this rating work?
        </button>
      </div>
      <div className="bg-[#23283a] rounded-xl shadow p-4">
        <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">Top 20 Traders</h2>
        <div className="divide-y divide-[#23283a]">
          {leaderboardData.map((user, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2 py-3 rounded-lg transition-colors hover:bg-[#22263a] group"
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold w-7 text-center text-lg ${idx < 3 ? 'text-yellow-400' : 'text-white'}`}>{idx + 1}</span>
                <span className="bg-[#23283a] rounded-full w-7 h-7 flex items-center justify-center text-xl group-hover:bg-[#31374a]">🥇</span>
                <span className="text-white text-base font-semibold truncate max-w-[120px]">{user.name}</span>
              </div>
              <span className="text-green-400 font-bold text-base">${user.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LeaderBoard;
