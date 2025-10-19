"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MainAppLayout from '../../components/MainAppLayout';
import { authUtils } from '@/lib/auth';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id;
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');

  const fetchTournament = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        cache: 'no-store',
        headers
      });

      if (!res.ok) throw new Error(`Failed to load tournament: ${res.status}`);
      const data = await res.json();
      
      setTournament(data.tournament);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(fetchTournament, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchTournament]);

  const formatTimeLeft = (ms) => {
    if (!ms) return '—';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getPrizeForRank = (rank) => {
    if (!tournament?.prizes) return null;
    return tournament.prizes.find(p => p.rank === rank);
  };

  if (loading) {
    return (
      <MainAppLayout>
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading tournament...</p>
          </div>
        </div>
      </MainAppLayout>
    );
  }

  if (error || !tournament) {
    return (
      <MainAppLayout>
        <div className="bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <div className="bg-red-900/40 border border-red-700 rounded-lg p-6">
              <p className="text-red-300">{error || 'Tournament not found'}</p>
              <Link href="/tournaments" className="inline-block mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded">
                Back to Tournaments
              </Link>
            </div>
          </div>
        </div>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-blue-800 border-b border-purple-500 p-6">
          <div className="mb-4">
            <Link href="/tournaments" className="text-purple-200 hover:text-white">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Tournaments
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-trophy text-yellow-400 mr-3"></i>
                {tournament.title}
              </h1>
              <p className="text-purple-200">{tournament.description || 'Trading Tournament'}</p>
            </div>
            
            <button onClick={fetchTournament} className="text-purple-200 hover:text-white">
              <i className="fas fa-rotate-right text-xl"></i>
            </button>
          </div>

          {/* Tournament Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="text-purple-200 text-sm mb-1">Prize Pool</div>
              <div className="text-2xl font-bold text-green-400">
                ${Number(tournament.total_prize_pool || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="text-purple-200 text-sm mb-1">Participants</div>
              <div className="text-2xl font-bold">
                {tournament.participantCount}
                {tournament.max_participants ? `/${tournament.max_participants}` : ''}
              </div>
            </div>
            
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="text-purple-200 text-sm mb-1">Status</div>
              <div className="text-2xl font-bold">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  tournament.status === 'ACTIVE' ? 'bg-green-600' :
                  tournament.status === 'UPCOMING' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {tournament.status}
                </span>
              </div>
            </div>
            
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="text-purple-200 text-sm mb-1">
                {tournament.status === 'ACTIVE' ? 'Time Left' : 'Entry Fee'}
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {tournament.status === 'ACTIVE' 
                  ? formatTimeLeft(tournament.timeLeftMs)
                  : `$${Number(tournament.entry_fee || 0).toFixed(0)}`
                }
              </div>
            </div>
          </div>

          {/* My Status (if joined) */}
          {tournament.isJoined && tournament.myParticipation && (
            <div className="mt-4 bg-blue-900/50 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-200 text-sm mb-1">Your Current Rank</div>
                  <div className="text-3xl font-bold">
                    {getMedalIcon(tournament.myParticipation.rank || 999)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-200 text-sm mb-1">Total Profit</div>
                  <div className={`text-2xl font-bold ${
                    Number(tournament.myParticipation.total_profit || 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    ${Number(tournament.myParticipation.total_profit || 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-200 text-sm mb-1">Trades</div>
                  <div className="text-2xl font-bold">
                    {tournament.myParticipation.total_trades || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-trophy mr-2"></i>
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'prizes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-gift mr-2"></i>
              Prizes
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'rules'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Rules
            </button>
          </div>

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-4 bg-gray-750 border-b border-gray-700">
                <h2 className="text-xl font-bold">
                  <i className="fas fa-chart-line mr-2 text-purple-400"></i>
                  Top Traders
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750 text-gray-300 text-sm">
                    <tr>
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">Trader</th>
                      <th className="px-4 py-3 text-right">Profit</th>
                      <th className="px-4 py-3 text-right">Trades</th>
                      <th className="px-4 py-3 text-right">Win Rate</th>
                      <th className="px-4 py-3 text-right">Volume</th>
                      <th className="px-4 py-3 text-right">Prize</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {tournament.leaderboard && tournament.leaderboard.length > 0 ? (
                      tournament.leaderboard.map((entry, index) => {
                        const prize = getPrizeForRank(entry.rank);
                        const isCurrentUser = tournament.myParticipation?.user_id === entry.user_id;
                        
                        return (
                          <tr 
                            key={entry.id} 
                            className={`hover:bg-gray-750 transition-colors ${
                              isCurrentUser ? 'bg-blue-900/30' : ''
                            }`}
                          >
                            <td className="px-4 py-4">
                              <span className="text-xl font-bold">
                                {getMedalIcon(entry.rank)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                  {entry.user?.name?.[0] || '?'}
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {entry.user?.name || 'Unknown'}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">YOU</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`px-4 py-4 text-right font-bold ${
                              Number(entry.total_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${Number(entry.total_profit || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {entry.total_trades || 0}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {Number(entry.win_rate || 0).toFixed(1)}%
                            </td>
                            <td className="px-4 py-4 text-right text-gray-400">
                              ${Number(entry.total_volume || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {prize ? (
                                <span className="text-green-400 font-bold">
                                  ${Number(prize.prize_amount).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                          <i className="fas fa-users text-4xl mb-3 block"></i>
                          No participants yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prizes Tab */}
          {activeTab === 'prizes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournament.prizes && tournament.prizes.length > 0 ? (
                tournament.prizes.map((prize) => (
                  <div 
                    key={prize.id} 
                    className={`rounded-lg border p-6 ${
                      prize.rank <= 3 
                        ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500' 
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{getMedalIcon(prize.rank)}</div>
                      <div className="text-gray-400 text-sm mb-2">
                        {prize.rank === 1 ? '1st Place' : 
                         prize.rank === 2 ? '2nd Place' : 
                         prize.rank === 3 ? '3rd Place' : 
                         `${prize.rank}th Place`}
                      </div>
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        ${Number(prize.prize_amount).toLocaleString()}
                      </div>
                      {prize.description && (
                        <p className="text-sm text-gray-400">{prize.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <i className="fas fa-gift text-4xl mb-3 block"></i>
                  No prizes configured
                </div>
              )}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4">
                <i className="fas fa-book mr-2 text-purple-400"></i>
                Tournament Rules
              </h2>
              
              {tournament.rules ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300">{tournament.rules}</div>
                </div>
              ) : (
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-check-circle text-green-400 mt-1"></i>
                    <div>
                      <strong>Starting Balance:</strong> All participants start with $10,000 virtual balance
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-check-circle text-green-400 mt-1"></i>
                    <div>
                      <strong>Ranking:</strong> Based on total profit/loss at the end of the tournament
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-check-circle text-green-400 mt-1"></i>
                    <div>
                      <strong>Trading:</strong> All trades made during the tournament period count
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-check-circle text-green-400 mt-1"></i>
                    <div>
                      <strong>Prizes:</strong> Distributed to top performers at tournament end
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainAppLayout>
  );
}
