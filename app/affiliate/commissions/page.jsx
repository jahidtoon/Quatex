'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faChartLine, faCalendar, faDownload,
  faEye, faPercentage, faTrophy, faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../dashboard/styles.css';

export default function AffiliateCommissions() {
  const [commissionsData, setCommissionsData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this_month');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      router.push('/affiliate/auth');
      return;
    }
    loadCommissionsData(token);
  }, [router]);

  const loadCommissionsData = async (token) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/affiliate/commissions', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCommissionsData(data);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, cardType, trend }) => {
    const cardClasses = {
      total: 'earnings-card',
      monthly: 'referrals-card', 
      pending: 'pending-card',
      rate: 'commission-card'
    };
    
    return (
      <div className={`stat-card-gradient ${cardClasses[cardType]} affiliate-card`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/80 mt-2 flex items-center">
                {trend && (
                  <FontAwesomeIcon 
                    icon={trend > 0 ? faArrowUp : faArrowDown} 
                    className={`mr-1 ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}
                  />
                )}
                {subtitle}
              </p>
            )}
          </div>
          <div className="text-4xl text-white/90">
            <FontAwesomeIcon icon={icon} />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="affiliate-dashboard-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">Loading Commissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-dashboard-bg min-h-screen">
      {/* Animated Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="blob blob-4"></div>
      
      {/* Main Content */}
      <div className="p-4 lg:p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Commission Overview 💰
          </h1>
          <p className="text-white/80 text-lg backdrop-blur-sm bg-white/10 rounded-lg p-4 inline-block border border-white/20">
            Track your earnings and commission structure
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={faDollarSign}
            title="Total Commission"
            value={`$${commissionsData?.stats?.totalCommission?.toLocaleString() || '0'}`}
            subtitle="All time earnings"
            cardType="total"
            trend={12}
          />
          <StatCard
            icon={faChartLine}
            title="This Month"
            value={`$${commissionsData?.stats?.thisMonth?.toLocaleString() || '0'}`}
            subtitle="Current month"
            cardType="monthly"
            trend={8}
          />
          <StatCard
            icon={faCalendar}
            title="Pending Amount"
            value={`$${commissionsData?.stats?.pendingAmount?.toLocaleString() || '0'}`}
            subtitle="Awaiting payment"
            cardType="pending"
          />
          <StatCard
            icon={faPercentage}
            title="Commission Rate"
            value={`${commissionsData?.stats?.avgCommissionRate || 0}%`}
            subtitle="Current tier"
            cardType="rate"
          />
        </div>

        {/* Filter and Controls */}
        <div className="affiliate-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
            <button className="btn-gradient-success px-4 py-2 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="affiliate-card mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trade Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissionsData?.commissions
                  ?.filter(commission => activeFilter === 'all' || commission.status === activeFilter)
                  ?.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{commission.referralName}</div>
                        <div className="text-sm text-gray-500">{commission.referralEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${commission.tradeAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${commission.commissionAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.commissionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        commission.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {commission.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="affiliate-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Commission Tier Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commissionsData?.tiers?.map((tier, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                tier.current 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <FontAwesomeIcon icon={faTrophy} className={`text-2xl mb-2 ${
                    tier.current ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                  <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                  <p className="text-2xl font-bold text-blue-600">{tier.rate}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {tier.minReferrals}+ referrals
                  </p>
                  {tier.current && (
                    <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Current Tier
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
