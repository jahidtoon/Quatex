'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserPlus, faEye, faSearch, faFilter, faDownload,
  faCalendar, faGlobe, faEnvelope, faPhone, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../dashboard/styles.css';

export default function AffiliateReferrals() {
  const [referralsData, setReferralsData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      router.push('/affiliate/auth');
      return;
    }
    loadReferralsData();
  }, [router]);

  const loadReferralsData = async () => {
    try {
      setIsLoading(true);
      // Mock data for referrals
      const mockData = {
        success: true,
        stats: {
          totalReferrals: 156,
          activeReferrals: 142,
          pendingReferrals: 14,
          thisMonth: 23,
          conversionRate: 68.5
        },
        referrals: [
          {
            id: 'REF001',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1234567890',
            country: 'United States',
            joinDate: '2024-08-15',
            lastActivity: '2024-09-08',
            status: 'Active',
            totalDeposit: 2500,
            totalTrades: 45,
            earnings: 450.00,
            tier: 'Gold'
          },
          {
            id: 'REF002',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '+1234567891',
            country: 'Canada',
            joinDate: '2024-08-20',
            lastActivity: '2024-09-07',
            status: 'Active',
            totalDeposit: 1800,
            totalTrades: 32,
            earnings: 337.50,
            tier: 'Silver'
          },
          {
            id: 'REF003',
            name: 'Mike Wilson',
            email: 'mike@example.com',
            phone: '+1234567892',
            country: 'United Kingdom',
            joinDate: '2024-09-01',
            lastActivity: '2024-09-06',
            status: 'Pending',
            totalDeposit: 500,
            totalTrades: 8,
            earnings: 200.00,
            tier: 'Bronze'
          },
          {
            id: 'REF004',
            name: 'Emma Davis',
            email: 'emma@example.com',
            phone: '+1234567893',
            country: 'Australia',
            joinDate: '2024-07-10',
            lastActivity: '2024-09-08',
            status: 'Active',
            totalDeposit: 3200,
            totalTrades: 67,
            earnings: 680.00,
            tier: 'Platinum'
          }
        ],
        countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France']
      };
      setReferralsData(mockData);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, cardType, trend }) => {
    const cardClasses = {
      total: 'referrals-card',
      active: 'earnings-card', 
      pending: 'pending-card',
      monthly: 'commission-card'
    };
    
    return (
      <div className={`stat-card-gradient ${cardClasses[cardType]} affiliate-card`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/80 mt-2">{subtitle}</p>
            )}
          </div>
          <div className="text-4xl text-white/90">
            <FontAwesomeIcon icon={icon} />
          </div>
        </div>
      </div>
    );
  };

  const filteredReferrals = referralsData?.referrals?.filter(referral => {
    const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || referral.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesCountry = filterCountry === 'all' || referral.country === filterCountry;
    return matchesSearch && matchesStatus && matchesCountry;
  }) || [];

  if (isLoading) {
    return (
      <div className="affiliate-dashboard-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">Loading Referrals...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-4">
            My Referrals 👥
          </h1>
          <p className="text-white/80 text-lg backdrop-blur-sm bg-white/10 rounded-lg p-4 inline-block border border-white/20">
            Manage and track your referred users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={faUsers}
            title="Total Referrals"
            value={referralsData?.stats?.totalReferrals || 0}
            subtitle="All time"
            cardType="total"
          />
          <StatCard
            icon={faUserPlus}
            title="Active Users"
            value={referralsData?.stats?.activeReferrals || 0}
            subtitle="Currently trading"
            cardType="active"
          />
          <StatCard
            icon={faCalendar}
            title="This Month"
            value={referralsData?.stats?.thisMonth || 0}
            subtitle="New referrals"
            cardType="monthly"
          />
          <StatCard
            icon={faChartLine}
            title="Conversion Rate"
            value={`${referralsData?.stats?.conversionRate || 0}%`}
            subtitle="Success rate"
            cardType="pending"
          />
        </div>

        {/* Filters and Search */}
        <div className="affiliate-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {referralsData?.countries?.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <button className="btn-gradient-success px-4 py-2 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Referrals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredReferrals.map((referral) => (
            <div key={referral.id} className="affiliate-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${referral.name}&background=random`}
                    alt={referral.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{referral.name}</h3>
                    <p className="text-sm text-gray-500">{referral.tier} Tier</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  referral.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {referral.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                  {referral.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 mr-2" />
                  {referral.country}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
                  Joined: {referral.joinDate}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Deposit</p>
                    <p className="font-semibold text-green-600">${referral.totalDeposit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Earnings</p>
                    <p className="font-semibold text-blue-600">${referral.earnings}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Trades</span>
                  <span>{referral.totalTrades}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                    style={{width: `${Math.min((referral.totalTrades / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Last activity: {referral.lastActivity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Table View */}
        <div className="affiliate-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Referrals List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${referral.name}&background=random`}
                          alt={referral.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-500">{referral.tier} Tier</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{referral.email}</div>
                      <div className="text-sm text-gray-500">{referral.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        referral.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined: {referral.joinDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${referral.totalDeposit} deposited</div>
                      <div className="text-sm text-gray-500">{referral.totalTrades} trades</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${referral.earnings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
