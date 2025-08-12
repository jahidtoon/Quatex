import React from 'react';

const More = ({ setCurrentPage }) => (
  <div className="w-full max-w-md mx-auto p-8">
    <div className="space-y-4">
      <button
        onClick={() => setCurrentPage && setCurrentPage('analytics')}
        className="w-full flex items-center justify-between bg-[#23283a] rounded-lg px-6 py-5 shadow hover:bg-[#31374a] transition-colors"
      >
        <span className="flex items-center gap-4">
          <i className="fas fa-chart-pie text-2xl text-white" />
          <span className="text-white font-bold text-lg">Analytics</span>
        </span>
        <i className="fas fa-chevron-right text-secondary text-lg" />
      </button>
      <button
        onClick={() => setCurrentPage && setCurrentPage('top')}
        className="w-full flex items-center justify-between bg-[#23283a] rounded-lg px-6 py-5 shadow hover:bg-[#31374a] transition-colors"
      >
        <span className="flex items-center gap-4">
          <i className="fas fa-chart-bar text-2xl text-white" />
          <span className="text-white font-bold text-lg">TOP</span>
        </span>
        <i className="fas fa-chevron-right text-secondary text-lg" />
      </button>
      <button
        onClick={() => setCurrentPage && setCurrentPage('signals')}
        className="w-full flex items-center justify-between bg-[#23283a] rounded-lg px-6 py-5 shadow hover:bg-[#31374a] transition-colors"
      >
        <span className="flex items-center gap-4">
          <i className="fas fa-broadcast-tower text-2xl text-white" />
          <span className="text-white font-bold text-lg">Signals</span>
        </span>
        <i className="fas fa-chevron-right text-secondary text-lg" />
      </button>
    </div>
  </div>
);
export default More;
