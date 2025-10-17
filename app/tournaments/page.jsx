"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';
import { authUtils } from '@/lib/auth';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`/api/tournaments?status=${activeTab === 'my-tournaments' ? '' : activeTab.toUpperCase()}`, {
        cache: 'no-store',
        headers
      });

      if (!res.ok) throw new Error(`Failed to load tournaments: ${res.status}`);
      const data = await res.json();
      
      setTournaments(data.tournaments || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTournaments();
    const interval = setInterval(fetchTournaments, 30000);
    return () => clearInterval(interval);
  }, [fetchTournaments]);

  const handleJoinTournament = async (tournamentId) => {
    if (!authUtils.isAuthenticated()) {
      alert('Please login to join tournaments');
      window.location.href = '/auth/login';
      return;
    }

    if (joiningId) return;
    setJoiningId(tournamentId);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join tournament');
      }

      alert('Successfully joined tournament! Starting balance: $10,000');
      fetchTournaments();
    } catch (err) {
      alert(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  const formatTimeLeft = (ms) => {
    if (!ms) return '—';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (type) => {
    switch(type) {
      case 'PROFIT_BASED': return 'text-green-400 bg-green-900';
      case 'WIN_RATE': return 'text-yellow-400 bg-yellow-900';
      case 'VOLUME_BASED': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'PROFIT_BASED': return 'Profit Based';
      case 'WIN_RATE': return 'Win Rate';
      case 'VOLUME_BASED': return 'Volume Based';
      case 'MIXED': return 'Mixed';
      default: return type;
    }
  };

  const tabs = [
    { id: 'active', label: 'Active', icon: 'fa-play' },
    { id: 'upcoming', label: 'Upcoming', icon: 'fa-calendar' },
    { id: 'completed', label: 'Completed', icon: 'fa-check' },
    { id: 'my-tournaments', label: 'My Tournaments', icon: 'fa-user' }
  ];

  const filteredTournaments = activeTab === 'my-tournaments'
    ? tournaments.filter(t => t.isJoined)
    : tournaments;

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white min-h-screen">
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
              <button onClick={fetchTournaments} className="text-gray-400 hover:text-white">
                <i className="fas fa-rotate-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trophy text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold">{stats.active || 0}</h3>
              <p className="text-gray-400">Active Tournaments</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold">${(stats.totalPrizePool || 0).toLocaleString()}</h3>
              <p className="text-gray-400">Total Prize Pool</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalParticipants || 0}</h3>
              <p className="text-gray-400">Participants</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-medal text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold">
                {tournaments.filter(t => t.isJoined).length}
              </h3>
              <p className="text-gray-400">My Tournaments</p>
            </div>
          </div>

          <div className="flex space-x-4 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
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

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tournaments...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-900/40 border border-red-700 rounded-lg p-6 mb-6">
              <p className="text-red-300">{error}</p>
              <button onClick={fetchTournaments} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTournaments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-trophy text-6xl text-gray-600 mb-4"></i>
                  <p className="text-xl text-gray-400">No tournaments found</p>
                </div>
              ) : (
                filteredTournaments.map((tournament) => (
                  <div key={tournament.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{tournament.title}</h3>
                          <p className="text-purple-100 text-sm">{getTypeLabel(tournament.type)}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(tournament.type)}`}>
                          {tournament.status}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Prize Pool</span>
                          <span className="text-2xl font-bold text-green-400">
                            ${Number(tournament.total_prize_pool || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Entry Fee</span>
                          <span className="text-lg font-semibold">
                            ${Number(tournament.entry_fee || 0).toFixed(2)}
                          </span>
                        </div>

                        {tournament.status === 'ACTIVE' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Time Left</span>
                            <span className="text-lg font-semibold text-yellow-400">
                              {formatTimeLeft(tournament.timeLeftMs)}
                            </span>
                          </div>
                        )}

                        {tournament.status === 'UPCOMING' && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Starts</span>
                            <span className="text-sm">
                              {new Date(tournament.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Participants</span>
                            <span>
                              {tournament.participantCount}
                              {tournament.max_participants ? `/${tournament.max_participants}` : ''}
                            </span>
                          </div>
                          {tournament.max_participants && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, (tournament.participantCount / tournament.max_participants) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {tournament.prizes && tournament.prizes.length > 0 && (
                          <div className="border-t border-gray-700 pt-4">
                            <p className="text-xs text-gray-400 mb-2">Top Prizes</p>
                            <div className="space-y-1">
                              {tournament.prizes.slice(0, 3).map((prize) => (
                                <div key={prize.id} className="flex justify-between text-sm">
                                  <span className="text-gray-300">#{prize.rank}</span>
                                  <span className="text-green-400 font-semibold">
                                    ${Number(prize.prize_amount).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tournament.isJoined && tournament.myParticipation && (
                          <div className="bg-blue-900/40 border border-blue-700 rounded p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-300 text-sm">Your Rank</span>
                              <span className="text-xl font-bold text-blue-400">
                                #{tournament.myParticipation.rank || '—'}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                              <span className="text-gray-400">Profit</span>
                              <span className={Number(tournament.myParticipation.total_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                                ${Number(tournament.myParticipation.total_profit || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 space-y-2">
                        {tournament.isJoined ? (
                          <>
                            <Link 
                              href={`/tournaments/${tournament.id}`}
                              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                            >
                              <i className="fas fa-chart-line mr-2"></i>
                              View Leaderboard
                            </Link>
                            <Link
                              href="/trade"
                              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                            >
                              <i className="fas fa-play mr-2"></i>
                              Start Trading
                            </Link>
                          </>
                        ) : tournament.status === 'ACTIVE' || tournament.status === 'UPCOMING' ? (
                          <button 
                            onClick={() => handleJoinTournament(tournament.id)}
                            disabled={joiningId === tournament.id || (tournament.spotsLeft !== null && tournament.spotsLeft <= 0)}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                          >
                            {joiningId === tournament.id ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Joining...
                              </>
                            ) : tournament.spotsLeft !== null && tournament.spotsLeft <= 0 ? (
                              <>
                                <i className="fas fa-lock mr-2"></i>
                                Full
                              </>
                            ) : (
                              <>
                                <i className="fas fa-play mr-2"></i>
                                Join Tournament
                              </>
                            )}
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="w-full bg-gray-600 cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg"
                          >
                            <i className="fas fa-check mr-2"></i>
                            Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MainAppLayout>
  );
}
