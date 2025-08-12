import React from 'react';

const FAQ = ({ setCurrentPage }) => (
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
        <h1 className="text-white text-xl font-semibold">FAQ</h1>
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
        {/* FAQ Items */}
        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">How do I start trading?</h3>
          <p className="text-gray-400 text-sm">To start trading, first complete your account verification, make a deposit, and then you can begin placing trades on various assets.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">What is the minimum deposit amount?</h3>
          <p className="text-gray-400 text-sm">The minimum deposit amount varies by payment method. Generally, it's $10 for most payment options.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">How can I withdraw my funds?</h3>
          <p className="text-gray-400 text-sm">You can withdraw funds through the same payment method you used for deposits. Go to the Withdrawal section and follow the instructions.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Is my personal data secure?</h3>
          <p className="text-gray-400 text-sm">Yes, we use advanced encryption and security measures to protect all your personal and financial information.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">What trading instruments are available?</h3>
          <p className="text-gray-400 text-sm">We offer various trading instruments including forex pairs, cryptocurrencies, commodities, and stock indices.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">How do I contact customer support?</h3>
          <p className="text-gray-400 text-sm">You can contact our 24/7 customer support through live chat, email, or phone. Visit the Support section for more details.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Can I use the platform on mobile?</h3>
          <p className="text-gray-400 text-sm">Yes, our platform is fully optimized for mobile devices and tablets for trading on the go.</p>
        </div>

        <div className="bg-[#1e2532] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">What are the trading hours?</h3>
          <p className="text-gray-400 text-sm">Trading is available 24/7 for cryptocurrencies, while forex and other markets follow their respective trading sessions.</p>
        </div>
      </div>
    </div>
  </div>
);

export default FAQ;
