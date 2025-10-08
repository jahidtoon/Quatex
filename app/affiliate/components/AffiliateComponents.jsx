'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faShare, faDownload } from '@fortawesome/free-solid-svg-icons';

export const ReferralLinkGenerator = ({ affiliateId }) => {
  const baseUrl = 'https://quatex.com/register';
  const referralLink = `${baseUrl}?ref=${affiliateId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Quatex Trading Platform',
        text: 'Start trading with the best platform!',
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm text-gray-600 break-all flex-1 mr-2">
            {referralLink}
          </code>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition duration-200"
              title="Copy Link"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
            <button
              onClick={shareLink}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition duration-200"
              title="Share Link"
            >
              <FontAwesomeIcon icon={faShare} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="bg-blue-100 rounded-lg p-4 mb-2">
            <FontAwesomeIcon icon={faCopy} className="text-blue-600 text-2xl" />
          </div>
          <h4 className="font-medium text-gray-900">Copy & Share</h4>
          <p className="text-sm text-gray-500">Copy your link and share everywhere</p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 rounded-lg p-4 mb-2">
            <FontAwesomeIcon icon={faShare} className="text-green-600 text-2xl" />
          </div>
          <h4 className="font-medium text-gray-900">Social Media</h4>
          <p className="text-sm text-gray-500">Share on Facebook, Twitter, etc.</p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 rounded-lg p-4 mb-2">
            <FontAwesomeIcon icon={faDownload} className="text-purple-600 text-2xl" />
          </div>
          <h4 className="font-medium text-gray-900">Email Marketing</h4>
          <p className="text-sm text-gray-500">Include in your email campaigns</p>
        </div>
      </div>
    </div>
  );
};

export const CommissionTiers = ({ currentTier, totalReferrals }) => {
  const tiers = [
    { name: 'Bronze', minReferrals: 0, maxReferrals: 50, commission: 30, color: 'bg-orange-500' },
    { name: 'Silver', minReferrals: 51, maxReferrals: 100, commission: 40, color: 'bg-gray-400' },
    { name: 'Gold', minReferrals: 101, maxReferrals: 200, commission: 45, color: 'bg-yellow-500' },
    { name: 'Platinum', minReferrals: 201, maxReferrals: null, commission: 60, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Tiers</h3>
      
      <div className="space-y-4">
        {tiers.map((tier) => {
          const isCurrentTier = tier.name === currentTier;
          const isAchieved = totalReferrals >= tier.minReferrals;
          
          return (
            <div
              key={tier.name}
              className={`border rounded-lg p-4 ${
                isCurrentTier 
                  ? 'border-blue-500 bg-blue-50' 
                  : isAchieved 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {tier.name} Tier
                      {isCurrentTier && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {tier.minReferrals}-{tier.maxReferrals || '∞'} active referrals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{tier.commission}%</p>
                  <p className="text-sm text-gray-500">Commission</p>
                </div>
              </div>
              
              {!isAchieved && (
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((totalReferrals / tier.minReferrals) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {tier.minReferrals - totalReferrals} more referrals needed
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ReferralStats = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Statistics</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalReferrals}</div>
            <div className="text-sm text-gray-500">Total Referrals</div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Active</span>
              <span className="text-green-600">{stats.activeReferrals}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.activeReferrals / stats.totalReferrals) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Earnings</div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-600">Pending</span>
              <span className="text-yellow-600">${stats.pendingPayments}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(stats.pendingPayments / stats.totalEarnings) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarketingMaterials = () => {
  const materials = [
    {
      title: 'Banner Ads',
      description: 'High-quality banner ads in various sizes (728x90, 300x250, etc.)',
      type: 'images',
      count: 12
    },
    {
      title: 'Email Templates',
      description: 'Ready-to-use HTML email templates for campaigns',
      type: 'html',
      count: 8
    },
    {
      title: 'Social Media Posts',
      description: 'Pre-designed posts for Facebook, Instagram, Twitter',
      type: 'social',
      count: 15
    },
    {
      title: 'Landing Page Templates',
      description: 'Conversion-optimized landing page templates',
      type: 'pages',
      count: 5
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Materials</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((material, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{material.title}</h4>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {material.count} files
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{material.description}</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download Pack
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📝 Quick Tips for Success</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use multiple marketing channels for better reach</li>
          <li>• Personalize your referral messages</li>
          <li>• Track which materials perform best</li>
          <li>• Engage with your referred users regularly</li>
        </ul>
      </div>
    </div>
  );
};
