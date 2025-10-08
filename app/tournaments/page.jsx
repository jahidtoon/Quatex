"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active Tournaments', icon: 'fa-play' },
    { id: 'upcoming', label: 'Upcoming', icon: 'fa-calendar' },
    { id: 'completed', label: 'Completed', icon: 'fa-check' },
    { id: 'my-tournaments', label: 'My Tournaments', icon: 'fa-user' }
  ];

  const activeTournaments = [
    {
      id: 1,
      name: 'Weekend Crypto Challenge',
      prize: '$10,000',
      participants: 245,
      maxParticipants: 500,
      entryFee: '$50',
      timeLeft: '2d 14h 35m',
      status: 'active',
      difficulty: 'Medium',
      type: 'Crypto Trading'
    },
    {
      id: 2,
      name: 'Forex Masters Cup',
      prize: '$25,000',
      participants: 180,
      maxParticipants: 300,
      entryFee: '$100',
      timeLeft: '5d 8h 22m',
      status: 'active',
      difficulty: 'Hard',
      type: 'Forex Trading'
    },
    {
      id: 3,
      name: 'Rookie Championship',
      prize: '$5,000',
      participants: 420,
      maxParticipants: 1000,
      entryFee: '$25',
      timeLeft: '1d 6h 45m',
      status: 'active',
      difficulty: 'Easy',
      type: 'Multi-Asset'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900';
      case 'Medium': return 'text-yellow-400 bg-yellow-900';
      case 'Hard': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-trophy text-purple-400 mr-3"></i>
              Tournaments
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <i className="fas fa-users mr-1"></i>
              845 Active Participants
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg">
              <i className="fas fa-plus mr-2"></i>Create Tournament
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tournament Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-xl"></i>
            </div>
            <h3 className="text-2xl font-bold">12</h3>
            <p className="text-gray-400">Active Tournaments</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-dollar-sign text-xl"></i>
            </div>
            <h3 className="text-2xl font-bold">$150K</h3>
            <p className="text-gray-400">Total Prize Pool</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <h3 className="text-2xl font-bold">845</h3>
            <p className="text-gray-400">Participants</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-medal text-xl"></i>
            </div>
            <h3 className="text-2xl font-bold">3</h3>
            <p className="text-gray-400">My Tournaments</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              {/* Tournament Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{tournament.name}</h3>
                    <p className="text-purple-100">{tournament.type}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(tournament.difficulty)}`}>
                    {tournament.difficulty}
                  </div>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-2xl font-bold text-green-400">{tournament.prize}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Entry Fee</span>
                    <span className="text-lg font-semibold">{tournament.entryFee}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Time Left</span>
                    <span className="text-lg font-semibold text-yellow-400">{tournament.timeLeft}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants</span>
                      <span>{tournament.participants}/{tournament.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  <i className="fas fa-play mr-2"></i>
                  Join Tournament
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Tournament */}
        <div className="mt-12 bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg border border-purple-500 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🏆 Grand Championship 2025 🏆</h2>
            <p className="text-xl text-purple-100 mb-6">The biggest trading tournament of the year!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">$100,000</div>
                <div className="text-purple-200">Prize Pool</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">30 Days</div>
                <div className="text-purple-200">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">1000</div>
                <div className="text-purple-200">Max Participants</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-purple-100 mb-6">Starting January 1st, 2025. Registration opens soon!</p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg">
                <i className="fas fa-bell mr-2"></i>
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}
