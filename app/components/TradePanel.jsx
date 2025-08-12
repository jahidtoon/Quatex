import React from 'react';

const TradePanel = () => {
  return (
    <aside className="w-full md:w-72 bg-secondary p-4 flex-shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <i className="fas fa-plus-circle text-green-500" />
          <span className="text-white font-semibold">AUD/CHF (OTC)</span>
          <span className="text-green-500 font-semibold">80%</span>
        </div>
        <i className="fas fa-times text-secondary" />
      </div>
      <div className="bg-tertiary p-3 rounded-md mb-4">
        <div className="flex items-center justify-between">
          <span className="text-secondary text-sm">PENDING TRADE</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-secondary mb-1 block">Time</label>
          <div className="flex items-center bg-tertiary rounded-md p-1">
            <button className="flex-1 text-secondary p-2 rounded-md"><i className="fas fa-minus" /></button>
            <div className="text-white font-semibold px-4">00:01:00</div>
            <button className="flex-1 text-secondary p-2 rounded-md"><i className="fas fa-plus" /></button>
          </div>
        </div>
        <div>
          <label className="text-sm text-secondary mb-1 block">Investment</label>
          <div className="flex items-center bg-tertiary rounded-md p-1">
            <button className="flex-1 text-secondary p-2 rounded-md"><i className="fas fa-minus" /></button>
            <div className="text-white font-semibold px-4">1,000 $</div>
            <button className="flex-1 text-secondary p-2 rounded-md"><i className="fas fa-plus" /></button>
          </div>
        </div>
        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold p-4 rounded-md transition duration-300 text-left">
          <i className="fas fa-arrow-up mr-2" />
          <span>Up</span>
          <div className="text-sm text-green-200 mt-1">Your payout: 1800.00 $</div>
        </button>
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded-md transition duration-300 text-left">
          <i className="fas fa-arrow-down mr-2" />
          <span>Down</span>
        </button>
      </div>
      <div className="flex items-center justify-between mt-6 border-t border-custom pt-4">
        <span className="font-semibold">Trades <span className="bg-tertiary text-xs px-2 py-1 rounded-full">0</span></span>
        <i className="fas fa-sync text-secondary" />
      </div>
      <div className="text-center mt-8 text-secondary">
        <i className="fas fa-history text-4xl mb-2" />
        <p className="text-sm">You don't have a trade history yet. You can open a trade.</p>
      </div>
    </aside>
  );
};
export default TradePanel;
