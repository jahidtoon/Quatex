import React from 'react';

const Support = ({ setCurrentPage }) => (
  <div className="w-full h-full bg-[#2a3142] flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-600">
      <div className="flex items-center">
        <button className="text-white mr-4">
          <i className="fas fa-bars text-lg"></i>
        </button>
        <h1 className="text-white text-xl font-semibold">Help</h1>
      </div>
      <button className="text-gray-400 hover:text-white">
        <i className="fas fa-times text-lg"></i>
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 p-8">
      <div className="flex flex-col gap-4">
        {/* FAQ */}
        <div
          className="flex items-center gap-4 bg-[#1e2532] rounded-lg px-6 py-5 cursor-pointer hover:bg-[#252b3a] transition-colors"
          onClick={() => setCurrentPage('faq')}
        >
          <div className="flex items-center justify-center w-14 h-14 bg-[#23283a] rounded-full">
            <i className="fas fa-question-circle text-blue-400 text-3xl"></i>
          </div>
          <div className="flex-1">
            <div className="text-white text-lg font-bold">FAQ</div>
            <div className="text-gray-400 text-sm">Open the database</div>
          </div>
        </div>

        {/* Tutorials */}
        <div
          className="flex items-center gap-4 bg-[#1e2532] rounded-lg px-6 py-5 cursor-pointer hover:bg-[#252b3a] transition-colors"
          onClick={() => setCurrentPage('tutorials')}
        >
          <div className="flex items-center justify-center w-14 h-14 bg-[#23283a] rounded-full">
            <i className="fas fa-graduation-cap text-blue-400 text-3xl"></i>
          </div>
          <div className="flex-1">
            <div className="text-white text-lg font-bold">Tutorials</div>
            <div className="text-gray-400 text-sm">Use the hints</div>
          </div>
        </div>

        {/* Support */}
        <div
          className="flex items-center gap-4 bg-[#1e2532] rounded-lg px-6 py-5 cursor-pointer hover:bg-[#252b3a] transition-colors"
          onClick={() => setCurrentPage('support-contact')}
        >
          <div className="flex items-center justify-center w-14 h-14 bg-[#23283a] rounded-full">
            <i className="fas fa-headphones text-blue-400 text-3xl"></i>
          </div>
          <div className="flex-1">
            <div className="text-white text-lg font-bold">Support</div>
            <div className="text-gray-400 text-sm">Submit a ticket</div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 bg-[#1e2532] rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-question text-white text-xl"></i>
          </div>
        </div>
        <h3 className="text-white text-base font-medium mb-2">Didn't find an answer to your question?</h3>
        <button 
          className="text-blue-500 hover:text-blue-400 font-medium"
          onClick={() => setCurrentPage('support-contact')}
        >
          Contact support
        </button>
      </div>
    </div>

    {/* Bottom Navigation Icons */}
    <div className="flex justify-center space-x-6 p-4 border-t border-gray-600">
      <button className="text-gray-400 hover:text-white">
        <i className="fas fa-th text-lg"></i>
      </button>
      <button className="text-gray-400 hover:text-white">
        <i className="fas fa-volume-up text-lg"></i>
      </button>
      <div className="relative">
        <button className="text-gray-400 hover:text-white">
          <i className="fas fa-bell text-lg"></i>
        </button>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">4</span>
      </div>
    </div>
  </div>
);
export default Support;
