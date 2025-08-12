import React, { useState } from 'react';

const Market = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const promoOffers = [
    {
      id: 1,
      title: 'Risk Free',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '🛡️',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'risk-free',
      hasSpecialOffer: true
    },
    {
      id: 2,
      title: 'Cashback',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '%',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'cashback'
    },
    {
      id: 3,
      title: 'Deposit Bonus',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '🔒',
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'deposit'
    },
    {
      id: 4,
      title: 'Percentage of turnover',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '%',
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'turnover'
    },
    {
      id: 5,
      title: 'Balance Bonus',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '🎁',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'balance'
    },
    {
      id: 6,
      title: 'Cancel X points',
      subtitle: '0 PROMO CODES AVAILABLE',
      icon: '🎯',
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: "You don't have a promo code history yet. You can add a promo code using the button below.",
      category: 'cancel'
    }
  ];

  const filteredOffers = selectedCategory === 'all' 
    ? promoOffers 
    : promoOffers.filter(offer => offer.category === selectedCategory);

  return (
    <div className="p-6 bg-[#23283a] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Market</h1>
        <p className="text-gray-400">Promotional codes and bonuses available</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            All Offers
          </button>
          <button
            onClick={() => setSelectedCategory('risk-free')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'risk-free'
                ? 'bg-green-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            Risk Free
          </button>
          <button
            onClick={() => setSelectedCategory('cashback')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'cashback'
                ? 'bg-green-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            Cashback
          </button>
          <button
            onClick={() => setSelectedCategory('deposit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'deposit'
                ? 'bg-green-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            Deposit Bonus
          </button>
        </div>
      </div>

      {/* Promo Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <div key={offer.id} className="bg-[#31374a] rounded-lg p-6 hover:bg-[#3a4155] transition-colors">
            {/* Header with Icon and Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${offer.bgColor} flex items-center justify-center text-xl`}>
                  {offer.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{offer.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{offer.subtitle}</p>
                </div>
              </div>
              <span className="text-gray-400 cursor-pointer hover:text-white text-lg">ℹ️</span>
            </div>

            {/* Promo Code Details */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>PROMO CODE</span>
                <span>STATUS</span>
                <span>USED</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4 text-4xl opacity-30">
                💰
              </div>
              <p className="text-gray-400 text-sm mb-4">{offer.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                📊 Show all history
              </button>
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Enter promo code
              </button>
            </div>

            {/* Get Free Button (for Risk Free offer) */}
            {offer.hasSpecialOffer && (
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium mt-2 transition-colors">
                Get 3$ Free
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-[#31374a] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3">How to use promotional codes</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Enter your promotional code in the designated field</p>
          <p>• Check the terms and conditions for each offer</p>
          <p>• Codes are valid for a limited time only</p>
          <p>• Some offers may require minimum deposit amounts</p>
        </div>
      </div>
    </div>
  );
};

export default Market;
