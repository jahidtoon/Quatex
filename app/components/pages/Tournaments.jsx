import React, { useState } from 'react';

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState('ACTIVE');

  const activeTournaments = [
    {
      id: 1,
      title: "Weekend Battle",
      prizePool: "3000 $",
      entryFee: "1 $",
      participants: "1638",
      duration: "2 days",
      status: "ACTIVE NOW",
      statusColor: "bg-blue-600"
    },
    {
      id: 2,
      title: "Crazy! Wednesday",
      prizePool: "5000 $",
      entryFee: "10 $",
      participants: "47",
      duration: "1 day",
      status: "UNTIL START: 3 DAYS",
      statusColor: "bg-blue-600"
    },
    {
      id: 3,
      title: "Free Friday",
      prizePool: "600 $",
      entryFee: "0 $",
      participants: "8238",
      duration: "1 day",
      status: "UNTIL START: 6 DAYS",
      statusColor: "bg-blue-600"
    },
    {
      id: 4,
      title: "Weekend Battle",
      prizePool: "3000 $",
      entryFee: "1 $",
      participants: "59",
      duration: "2 days",
      status: "UNTIL START: 6 DAYS",
      statusColor: "bg-blue-600"
    }
  ];

  return (
    <div className="w-full h-full bg-[#23283a] p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold text-white">Tournaments</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#31374a] mb-6">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'ACTIVE'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          ACTIVE
          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'COMPLETED'
              ? 'text-blue-400 border-blue-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          COMPLETED
        </button>
      </div>

      {/* Available for participation header */}
      <div className="text-center mb-6">
        <h2 className="text-lg text-white font-semibold">Available for participation (4)</h2>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-[#2a3142] rounded-lg p-6 border border-[#31374a] hover:border-[#404556] transition-colors"
          >
            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold text-white ${tournament.statusColor}`}>
                {tournament.status}
              </span>
            </div>

            {/* Prize Pool */}
            <div className="text-right mb-2">
              <span className="text-xs text-gray-400 uppercase">PRIZE POOL</span>
            </div>

            {/* Tournament Title */}
            <h3 className="text-xl font-bold text-white mb-4">{tournament.title}</h3>

            {/* Prize Amount */}
            <div className="text-right mb-6">
              <span className="text-2xl font-bold text-green-400">{tournament.prizePool}</span>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{tournament.entryFee}</div>
                <div className="text-xs text-gray-400">Entry fee</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{tournament.participants}</div>
                <div className="text-xs text-gray-400">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{tournament.duration}</div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
            </div>

            {/* Details Button */}
            <button className="w-full bg-[#23283a] hover:bg-[#31374a] text-white font-semibold py-2 px-4 rounded border border-[#31374a] transition-colors flex items-center justify-center">
              Details
              <i className="fas fa-info-circle ml-2"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;
