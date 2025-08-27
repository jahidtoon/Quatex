"use client";
import React, { useState } from 'react';

export default function TradingPanel({ currentPrice, selectedAsset }) {
	const [amount, setAmount] = useState(10);
	const [duration, setDuration] = useState(60);

	const quickAmounts = [10, 25, 50, 100];

	const executeTrade = (direction) => {
		console.log(`Trade: ${direction} ${selectedAsset} with $${amount} for ${duration}s @ ${currentPrice}`);
	};

	return (
		<aside className="w-full md:w-80 bg-slate-900 border-l border-slate-700 p-4 flex flex-col gap-4">
			<div>
				<div className="text-slate-400 text-sm">Asset</div>
				<div className="text-white font-semibold">{selectedAsset || '—'}</div>
				<div className="text-green-400 text-lg font-bold">{currentPrice ? `$${currentPrice.toLocaleString()}` : '—'}</div>
			</div>

			<div className="space-y-2">
				<label className="text-slate-300 text-sm">Amount</label>
				<input
					type="number"
					className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
					value={amount}
					min={1}
					onChange={(e) => setAmount(Number(e.target.value))}
				/>
				<div className="flex gap-2">
					{quickAmounts.map(v => (
						<button
							key={v}
							onClick={() => setAmount(v)}
							className={`px-3 py-1 rounded text-sm ${amount === v ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}
						>
							${v}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-slate-300 text-sm">Duration (sec)</label>
				<input
					type="number"
					className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
					value={duration}
					min={10}
					step={10}
					onChange={(e) => setDuration(Number(e.target.value))}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3 mt-auto">
				<button onClick={() => executeTrade('SELL')} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded">SELL</button>
				<button onClick={() => executeTrade('BUY')} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded">BUY</button>
			</div>
		</aside>
	);
}

