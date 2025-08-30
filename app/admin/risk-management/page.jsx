"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function RiskManagementPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [alertLevel, setAlertLevel] = useState('medium');

  // Mock risk data
  const riskMetrics = {
    totalExposure: 2450000,
    maxDrawdown: 125000,
    valueAtRisk: 89000,
    sharpeRatio: 1.84,
    riskScore: 6.7,
    leverageRatio: 15.3,
    marginUtilization: 68.4,
    correlationRisk: 'Medium'
  };

  const riskAlerts = [
    {
      id: 1,
      type: 'high',
      title: 'High Leverage Exposure',
      message: 'User john.doe@example.com has exceeded 1:400 leverage limit',
      user: 'john.doe@example.com',
      amount: 45000,
      timestamp: '2025-08-29 14:32:15',
      status: 'active'
    },
    {
      id: 2,
      type: 'medium',
      title: 'Correlation Risk Detected',
      message: 'Multiple positions in correlated pairs (EUR/USD, GBP/USD)',
      user: 'maria.garcia@example.com',
      amount: 28000,
      timestamp: '2025-08-29 14:18:42',
      status: 'monitoring'
    },
    {
      id: 3,
      type: 'low',
      title: 'Position Size Warning',
      message: 'Large position size relative to account balance',
      user: 'alex.johnson@example.com',
      amount: 15000,
      timestamp: '2025-08-29 13:45:30',
      status: 'resolved'
    },
    {
      id: 4,
      type: 'critical',
      title: 'Margin Call Required',
      message: 'Account balance below minimum margin requirement',
      user: 'mike.wilson@example.com',
      amount: 2500,
      timestamp: '2025-08-29 13:22:18',
      status: 'active'
    }
  ];

  const riskLimits = [
    {
      parameter: 'Maximum Leverage',
      current: '1:500',
      limit: '1:500',
      utilization: 85.2,
      status: 'warning'
    },
    {
      parameter: 'Position Size Limit',
      current: '$125,000',
      limit: '$150,000',
      utilization: 83.3,
      status: 'normal'
    },
    {
      parameter: 'Daily Loss Limit',
      current: '$12,500',
      limit: '$25,000',
      utilization: 50.0,
      status: 'normal'
    },
    {
      parameter: 'Correlation Exposure',
      current: '68%',
      limit: '75%',
      utilization: 90.7,
      status: 'warning'
    },
    {
      parameter: 'Margin Utilization',
      current: '68.4%',
      limit: '80%',
      utilization: 85.5,
      status: 'warning'
    }
  ];

  const topRiskyUsers = [
    {
      user: 'john.doe@example.com',
      riskScore: 8.9,
      exposure: 45000,
      leverage: '1:400',
      openPositions: 8,
      marginLevel: 150
    },
    {
      user: 'maria.garcia@example.com',
      riskScore: 7.8,
      exposure: 38000,
      leverage: '1:350',
      openPositions: 6,
      marginLevel: 200
    },
    {
      user: 'alex.johnson@example.com',
      riskScore: 7.2,
      exposure: 32000,
      leverage: '1:300',
      openPositions: 5,
      marginLevel: 180
    },
    {
      user: 'emma.davis@example.com',
      riskScore: 6.5,
      exposure: 28000,
      leverage: '1:250',
      openPositions: 4,
      marginLevel: 220
    }
  ];

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'high': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'low': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-600/20 text-red-400';
      case 'monitoring': return 'bg-yellow-600/20 text-yellow-400';
      case 'resolved': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getLimitStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'normal': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div>
      <AdminPageHeader 
        title="Risk Management" 
        subtitle="Monitor and manage platform risk exposure and user positions" 
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
              🚨 Emergency Stop
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              📊 Risk Report
            </button>
          </div>
        }
      />

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Exposure" 
          value={`$${(riskMetrics.totalExposure / 1000000).toFixed(1)}M`} 
          icon="⚠️"
          trend={{ value: 8.3, isPositive: false }}
        />
        <StatCard 
          title="Value at Risk" 
          value={`$${riskMetrics.valueAtRisk.toLocaleString()}`} 
          icon="📉"
          trend={{ value: -12.5, isPositive: true }}
        />
        <StatCard 
          title="Risk Score" 
          value={riskMetrics.riskScore.toString()} 
          icon="🎯"
          trend={{ value: 5.7, isPositive: false }}
        />
        <StatCard 
          title="Margin Utilization" 
          value={`${riskMetrics.marginUtilization}%`} 
          icon="📊"
          trend={{ value: 15.2, isPositive: false }}
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1">
          {['overview', 'alerts', 'limits', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Risk Distribution">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Currency Risk</span>
                <span className="text-yellow-400">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Leverage Risk</span>
                <span className="text-red-400">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Liquidity Risk</span>
                <span className="text-green-400">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Correlation Risk</span>
                <span className="text-yellow-400">Medium</span>
              </div>
            </div>
          </Card>

          <Card title="Portfolio Metrics">
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Sharpe Ratio</span>
                <span className="text-green-400 font-medium">{riskMetrics.sharpeRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Max Drawdown</span>
                <span className="text-red-400 font-medium">${riskMetrics.maxDrawdown.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Leverage Ratio</span>
                <span className="text-yellow-400 font-medium">1:{riskMetrics.leverageRatio}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedTab === 'alerts' && (
        <Card title="Risk Alerts">
          <div className="space-y-3 p-4">
            {riskAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getAlertTypeColor(alert.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-75">
                  <span>User: {alert.user}</span>
                  <span>Amount: ${alert.amount.toLocaleString()}</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === 'limits' && (
        <Card title="Risk Limits">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">Parameter</th>
                  <th className="text-left p-4">Current</th>
                  <th className="text-left p-4">Limit</th>
                  <th className="text-left p-4">Utilization</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riskLimits.map((limit, index) => (
                  <tr key={index} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4 font-medium">{limit.parameter}</td>
                    <td className="p-4">{limit.current}</td>
                    <td className="p-4">{limit.limit}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              limit.utilization >= 90 ? 'bg-red-500' : 
                              limit.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(limit.utilization, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{limit.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getLimitStatusColor(limit.status)}`}>
                        {limit.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedTab === 'users' && (
        <Card title="High Risk Users">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Risk Score</th>
                  <th className="text-left p-4">Exposure</th>
                  <th className="text-left p-4">Leverage</th>
                  <th className="text-left p-4">Open Positions</th>
                  <th className="text-left p-4">Margin Level</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topRiskyUsers.map((user, index) => (
                  <tr key={index} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4">{user.user}</td>
                    <td className="p-4">
                      <span className={`font-bold ${getRiskScoreColor(user.riskScore)}`}>
                        {user.riskScore}
                      </span>
                    </td>
                    <td className="p-4 font-medium">${user.exposure.toLocaleString()}</td>
                    <td className="p-4">{user.leverage}</td>
                    <td className="p-4">{user.openPositions}</td>
                    <td className="p-4">
                      <span className={user.marginLevel < 200 ? 'text-red-400' : 'text-green-400'}>
                        {user.marginLevel}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700">
                          Limit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
