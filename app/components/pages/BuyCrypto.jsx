import React from 'react';

const BuyCrypto = () => (
  <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
    <div className="bg-secondary p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-3xl font-bold text-white mb-6">Buy Crypto</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-main mb-1">Select Asset</label>
          <select className="w-full p-2 rounded bg-tertiary text-white">
            <option>Bitcoin (BTC)</option>
            <option>Ethereum (ETH)</option>
            <option>Tether (USDT)</option>
          </select>
        </div>
        <div>
          <label className="block text-main mb-1">Amount</label>
          <input type="number" className="w-full p-2 rounded bg-tertiary text-white" placeholder="Enter amount" />
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded">Buy Now</button>
      </form>
    </div>
  </div>
);

export default BuyCrypto;
