import React from 'react';

const Tutorials = ({ setCurrentPage }) => (
  <div className="w-full h-full bg-[#2a3142] flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-600">
      <div className="flex items-center">
        <button 
          className="text-white mr-4"
          onClick={() => setCurrentPage('support')}
        >
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-white text-xl font-semibold">Tutorials</h1>
      </div>
      <button 
        className="text-gray-400 hover:text-white"
        onClick={() => setCurrentPage('support')}
      >
        <i className="fas fa-times text-lg"></i>
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {/* Tutorial Items */}
        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-play text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Getting Started</h3>
              <p className="text-gray-400 text-sm">Learn the basics of trading platform</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">How to Place a Trade</h3>
              <p className="text-gray-400 text-sm">Step-by-step guide to making your first trade</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-wallet text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Deposits and Withdrawals</h3>
              <p className="text-gray-400 text-sm">Managing your account funds</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-shield-alt text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Account Security</h3>
              <p className="text-gray-400 text-sm">Keep your account safe and secure</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-cogs text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Platform Features</h3>
              <p className="text-gray-400 text-sm">Explore advanced trading tools</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-graduation-cap text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Trading Strategies</h3>
              <p className="text-gray-400 text-sm">Learn effective trading techniques</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-mobile-alt text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Mobile Trading</h3>
              <p className="text-gray-400 text-sm">Trade anywhere with mobile app</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4 cursor-pointer hover:bg-[#252b3a] transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-question-circle text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Troubleshooting</h3>
              <p className="text-gray-400 text-sm">Common issues and solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Tutorials;
