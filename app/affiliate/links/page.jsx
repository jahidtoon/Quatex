'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, faCopy, faEye, faEdit, faTrash, faPlus,
  faQrcode, faDownload, faShare, faChart, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../dashboard/styles.css';

export default function AffiliateLinks() {
  const [linksData, setLinksData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', campaign: '', utm_source: '', utm_medium: '', utm_campaign: '' });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      router.push('/affiliate/auth');
      return;
    }
    loadLinksData(token);
  }, [router]);

  const loadLinksData = async (token) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/affiliate/dashboard?type=stats', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLinksData({
        success: true,
        baseReferralCode: data?.affiliate?.referralCode,
        mainReferralLink: data?.referralLink,
        stats: { totalLinks: 0, totalClicks: 0, totalConversions: 0, conversionRate: 0 },
        links: []
      });
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const createNewLink = async () => {
    if (!newLink.name || !newLink.campaign) {
      alert('Please fill in all required fields');
      return;
    }
    const token = localStorage.getItem('affiliateToken');
    const res = await fetch('/api/affiliate/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'generate_link', campaign: newLink.campaign, source: newLink.utm_source, medium: newLink.utm_medium })
    });
    const data = await res.json();
    if (data?.link) alert(`New link created: ${data.link}`);
    setShowCreateForm(false);
    setNewLink({ name: '', campaign: '', utm_source: '', utm_medium: '', utm_campaign: '' });
  };

  const StatCard = ({ icon, title, value, subtitle, cardType }) => {
    const cardClasses = {
      links: 'referrals-card',
      clicks: 'earnings-card', 
      conversions: 'commission-card',
      rate: 'pending-card'
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

  if (isLoading) {
    return (
      <div className="affiliate-dashboard-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">Loading Affiliate Links...</p>
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
            Affiliate Links 🔗
          </h1>
          <p className="text-white/80 text-lg backdrop-blur-sm bg-white/10 rounded-lg p-4 inline-block border border-white/20">
            Create and manage your referral links
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={faLink}
            title="Total Links"
            value={linksData?.stats?.totalLinks || 0}
            subtitle="Active campaigns"
            cardType="links"
          />
          <StatCard
            icon={faEye}
            title="Total Clicks"
            value={linksData?.stats?.totalClicks?.toLocaleString() || '0'}
            subtitle="All time"
            cardType="clicks"
          />
          <StatCard
            icon={faChart}
            title="Conversions"
            value={linksData?.stats?.totalConversions || 0}
            subtitle="Successful signups"
            cardType="conversions"
          />
          <StatCard
            icon={faChart}
            title="Conversion Rate"
            value={`${linksData?.stats?.conversionRate || 0}%`}
            subtitle="Average rate"
            cardType="rate"
          />
        </div>

        {/* Main Referral Link */}
        <div className="affiliate-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Main Referral Link</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                <code className="text-lg font-bold text-blue-600">{linksData?.baseReferralCode}</code>
              </div>
              <button
                onClick={() => copyToClipboard(linksData?.baseReferralCode || '')}
                className="btn-gradient-info px-3 py-1 rounded text-sm"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Link</label>
                <code className="text-sm text-gray-600 break-all">{linksData?.mainReferralLink}</code>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => copyToClipboard(linksData?.mainReferralLink || '')}
                  className="btn-gradient-primary px-3 py-1 rounded text-sm"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
                <button className="btn-gradient-success px-3 py-1 rounded text-sm">
                  <FontAwesomeIcon icon={faQrcode} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Link Form */}
        {showCreateForm && (
          <div className="affiliate-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Tracking Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Name *</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Facebook Campaign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={newLink.campaign}
                  onChange={(e) => setNewLink({...newLink, campaign: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., summer2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UTM Source</label>
                <input
                  type="text"
                  value={newLink.utm_source}
                  onChange={(e) => setNewLink({...newLink, utm_source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., facebook, google, newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UTM Medium</label>
                <input
                  type="text"
                  value={newLink.utm_medium}
                  onChange={(e) => setNewLink({...newLink, utm_medium: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., post, email, banner"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createNewLink}
                className="btn-gradient-success px-4 py-2 rounded-lg"
              >
                Create Link
              </button>
            </div>
          </div>
        )}

        {/* Links Table */}
        <div className="affiliate-card">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Your Affiliate Links</h3>
            <button className="btn-gradient-success px-4 py-2 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linksData?.links?.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{link.name}</div>
                        <div className="text-sm text-gray-500">
                          Campaign: {link.campaign}
                        </div>
                        <div className="text-xs text-gray-400">
                          {link.utm_source} • {link.utm_medium}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {link.shortUrl}
                          </span>
                        </div>
                        <code className="text-xs text-gray-500 break-all">{link.url}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.clicks} clicks</div>
                      <div className="text-sm text-gray-500">{link.conversions} conversions</div>
                      <div className="text-sm font-medium text-green-600">{link.conversionRate}% rate</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.createdDate}</div>
                      <div className="text-sm text-gray-500">Last: {link.lastClicked}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(link.url)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy Link"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          title="View Analytics"
                        >
                          <FontAwesomeIcon icon={faChart} />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-800"
                          title="Generate QR"
                        >
                          <FontAwesomeIcon icon={faQrcode} />
                        </button>
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="text-gray-600 hover:text-gray-800"
                          title="Test Link"
                        >
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </button>
                      </div>
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
