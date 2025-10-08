'use client';

const ACCOUNT_TYPES = [
	{ key: 'live', label: 'Live', icon: 'fa-wallet', color: 'text-green-400' },
	{ key: 'demo', label: 'Demo', icon: 'fa-graduation-cap', color: 'text-blue-400' },
];

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth as useAuthState } from '@/lib/AuthContext';

const QUICK_AMOUNTS = [10, 25, 50, 100];
const QUICK_DURATIONS = [30, 60, 120, 300, 600];

function formatCurrency(value) {
	if (value === null || value === undefined || Number.isNaN(value)) return '—';
	try {
		return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	} catch {
		return `$${value}`;
	}
}

function formatTimeRemaining(seconds) {
	const safeSeconds = Math.max(0, Math.floor(seconds || 0));
	const m = Math.floor(safeSeconds / 60);
	const s = safeSeconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

function normalizeTrade(raw) {
	if (!raw) return null;
	const openTime = raw.openTime || raw.open_time;
	const closeTime = raw.closeTime || raw.close_time;
	const openDate = openTime ? new Date(openTime) : null;
	const closeDate = closeTime ? new Date(closeTime) : null;
	const closeTimeMs = closeDate ? closeDate.getTime() : null;
	const remaining = closeTimeMs ? Math.max(0, Math.ceil((closeTimeMs - Date.now()) / 1000)) : 0;
	const entry = raw.entryPrice ?? raw.entry_price;
	const entryPrice = entry != null ? Number(entry) : null;
	const payout = raw.payout != null ? Number(raw.payout) : null;
	const amount = Number(raw.amount ?? 0);

	// Calculate profit/loss
	let profitLoss = null;
	let profitLossPercent = null;

	if (raw.result === 'win' && payout !== null) {
		profitLoss = payout;
		profitLossPercent = (payout / amount) * 100;
	} else if (raw.result === 'loss') {
		profitLoss = -amount;
		profitLossPercent = -100;
	}

	return {
		id: raw.id,
		symbol: raw.symbol,
		direction: raw.direction,
		amount,
		status: raw.status || raw.result || 'pending',
		entryPrice,
		payout,
		openTime: openDate,
		closeTime: closeDate,
		closeTimeMs,
		timeRemaining: remaining,
		result: raw.result,
		profitLoss,
		profitLossPercent,
	};
}

function updateCountdown(trades) {
	return trades.map((trade) => {
		if (!trade?.closeTimeMs) return trade;
		const remaining = Math.max(0, Math.ceil((trade.closeTimeMs - Date.now()) / 1000));
		return { ...trade, timeRemaining: remaining };
	});
}

export default function TradingPanel({ currentPrice, selectedAsset, onAssetChange, onTradeExecuted }) {
	const { user, token, isAuthenticated, updateUser } = useAuthState();
	const [amount, setAmount] = useState(10);
	const [duration, setDuration] = useState(60);
	const [assets, setAssets] = useState([]);
	const [assetsLoading, setAssetsLoading] = useState(true);
	const [placing, setPlacing] = useState(false);
	const [feedback, setFeedback] = useState({ type: null, message: '' });
	const [recentTrades, setRecentTrades] = useState([]);
	const [accountType, setAccountType] = useState('live');
	const [availableBalance, setAvailableBalance] = useState(() => {
		if (!user) return null;
		return accountType === 'demo' ? Number(user?.demo_balance ?? 10000) : Number(user?.balance ?? 0);
	});

	useEffect(() => {
		if (!user) return;
		setAvailableBalance(accountType === 'demo' ? Number(user.demo_balance ?? 10000) : Number(user.balance ?? 0));
	}, [user, accountType]);

	useEffect(() => {
		let cancelled = false;
		async function loadAssets() {
			setAssetsLoading(true);
			try {
				const res = await fetch('/api/trades/assets');
				if (!res.ok) {
					throw new Error('Failed to load assets');
				}
				const data = await res.json();
				if (!cancelled) {
					const items = Array.isArray(data.assets) ? data.assets : [];
					setAssets(items);
					if (!selectedAsset && items.length && typeof onAssetChange === 'function') {
						onAssetChange(items[0].symbol);
					}
				}
			} catch (error) {
				if (!cancelled) {
					setFeedback({ type: 'error', message: error.message || 'Asset list unavailable' });
				}
			} finally {
				if (!cancelled) setAssetsLoading(false);
			}
		}
		loadAssets();
		return () => { cancelled = true; };
	}, [onAssetChange, selectedAsset]);

	const fetchRecentTrades = async () => {
		if (!token) return;
		try {
			const res = await fetch('/api/trades?limit=5', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!res.ok) {
				throw new Error('Failed to load recent trades');
			}
			const data = await res.json();
			const trades = Array.isArray(data.trades) ? data.trades.map(normalizeTrade).filter(Boolean) : [];
			setRecentTrades(trades);
		} catch (error) {
			console.warn('[trading-panel] recent trades error:', error.message);
		}
	};

	useEffect(() => {
		if (token) {
			fetchRecentTrades();
		} else {
			setRecentTrades([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	useEffect(() => {
		const id = setInterval(() => {
			setRecentTrades((prev) => updateCountdown(prev));
		}, 1000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		if (!feedback?.message) return;
		const timeout = setTimeout(() => setFeedback({ type: null, message: '' }), feedback.type === 'success' ? 5000 : 7000);
		return () => clearTimeout(timeout);
	}, [feedback]);

	const selectedAssetInfo = useMemo(() => assets.find((asset) => asset.symbol === selectedAsset), [assets, selectedAsset]);

	const handleAmountChange = (value) => {
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			setAmount(Math.max(1, Math.round(numeric)));
		}
	};

	const handleDurationChange = (value) => {
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			setDuration(Math.min(24 * 60 * 60, Math.max(10, Math.round(numeric))));
		}
	};

	const executeTrade = async (direction) => {
		setFeedback({ type: null, message: '' });

		if (!selectedAsset) {
			setFeedback({ type: 'error', message: 'Select an asset to trade.' });
			return;
		}
		if (!isAuthenticated || !token) {
			setFeedback({ type: 'error', message: 'আপনার ট্রেড প্লেস করতে লগইন করুন।' });
			return;
		}

		const tradeAmount = Number(amount);
		if (!Number.isFinite(tradeAmount) || tradeAmount < 1) {
			setFeedback({ type: 'error', message: 'Minimum trade amount is $1.' });
			return;
		}

		const tradeDuration = Number(duration);
		if (!Number.isFinite(tradeDuration) || tradeDuration < 10) {
			setFeedback({ type: 'error', message: 'Duration must be at least 10 seconds.' });
			return;
		}

		const price = Number(currentPrice);
		if (!Number.isFinite(price) || price <= 0) {
			setFeedback({ type: 'error', message: 'Live price unavailable. Please wait a moment.' });
			return;
		}

			setPlacing(true);
			try {
				const response = await fetch('/api/trades', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						symbol: selectedAsset,
						amount: tradeAmount,
						duration: tradeDuration,
						direction,
						price,
						accountType,
					}),
				});

				const data = await response.json();
				if (!response.ok) {
					throw new Error(data?.error || 'Failed to place trade');
				}

				setFeedback({
					type: 'success',
					message: `${direction === 'BUY' ? 'Buy' : 'Sell'} order placed on ${selectedAsset} for $${tradeAmount} (${accountType}).`,
				});

				if (data?.trade) {
					const normalized = normalizeTrade(data.trade);
					if (normalized) {
						setRecentTrades((prev) => [normalized, ...prev].slice(0, 5));
					}
				} else {
					fetchRecentTrades();
				}

				if (typeof onTradeExecuted === 'function') {
					onTradeExecuted();
				}

				if (typeof data?.balance === 'number') {
					setAvailableBalance(data.balance);
					if (user) {
						updateUser({ ...user, [accountType === 'demo' ? 'demo_balance' : 'balance']: data.balance });
					}
				}
			} catch (error) {
				setFeedback({ type: 'error', message: error.message || 'Trade failed. Please try again.' });
			} finally {
				setPlacing(false);
			}
		};

		return (
			<>
			{/* Width adjusted to prevent clipping: provide a safer minimum and allow slightly more space on md while still narrower than original */}
			<aside className="w-full md:w-64 xl:w-56 2xl:w-52 flex-shrink-0 bg-[#0f1320] border-l border-[#1f2937] p-4 flex flex-col gap-4 min-h-0 max-h-full overflow-y-auto min-w-[240px]">
				<div className="flex gap-2 mb-2">
					{ACCOUNT_TYPES.map((type) => (
						<button
							key={type.key}
							className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
								accountType === type.key
									? `${type.color} bg-[#1e293b] border-blue-500`
									: 'text-gray-400 bg-[#111827] border-[#374151] hover:bg-[#374151]'
							}`}
							onClick={() => setAccountType(type.key)}
							type="button"
						>
							<i className={`fas ${type.icon}`}></i>
							{type.label}
						</button>
					))}
				</div>
			<div className="bg-[#111827] rounded-lg p-3 border border-[#374151] space-y-2">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-[#9ca3af] text-xs uppercase tracking-wide">Asset</div>
						<div className="text-white font-semibold text-lg truncate">
							{selectedAssetInfo?.display || selectedAsset || '—'}
						</div>
					</div>
					<div className="text-right">
						<div className="text-xs text-[#6ee7b7]">Live</div>
						<div className="text-green-400 text-xl font-bold">
							{currentPrice ? formatCurrency(currentPrice) : '—'}
						</div>
					</div>
				</div>

				<div>
					<label className="text-[#9ca3af] text-xs uppercase block mb-1">Select market</label>
					<div className="relative">
						<select
							className="w-full bg-[#0f172a] border border-[#374151] rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none appearance-none"
							value={selectedAsset || ''}
							onChange={(e) => {
								const next = e.target.value;
								if (typeof onAssetChange === 'function') {
									onAssetChange(next);
								}
							}}
							disabled={assetsLoading}
						>
							{assetsLoading && <option>Loading…</option>}
							{!assetsLoading && assets.length === 0 && <option>No assets available</option>}
							{!assetsLoading && assets.length > 0 && (
								<>
									{(() => {
										const forex = assets.filter(a => a.symbol.includes('_'));
										const crypto = assets.filter(a => !a.symbol.includes('_'));
										return (
											<>
												{forex.length > 0 && (
													<optgroup label="Forex Pairs">
														{forex.map(asset => (
															<option key={asset.symbol} value={asset.symbol}>
																{(asset.display || asset.symbol.replace('_','/'))} {asset.payout ? `(${asset.payout}%)` : ''}
															</option>
														))}
													</optgroup>
												)}
												{crypto.length > 0 && (
													<optgroup label="Crypto">
														{crypto.map(asset => (
															<option key={asset.symbol} value={asset.symbol}>
																{asset.display || asset.symbol} {asset.payout ? `(${asset.payout}%)` : ''}
															</option>
														))}
													</optgroup>
												)}
											</>
										);
									})()}
								</>
							)}
						</select>
						<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
							<i className="fas fa-chevron-down text-xs" />
						</span>
					</div>
				</div>

				<div className="flex justify-between text-xs text-gray-400">
					<span>Type: {selectedAssetInfo?.type || '—'}</span>
					<span>Payout: {selectedAssetInfo?.payout ? `${selectedAssetInfo.payout}%` : '—'}</span>
				</div>

						<div className="bg-[#0f172a] rounded-md px-3 py-2 border border-[#1f2937] text-sm text-gray-300">
							{accountType === 'demo' ? 'Demo Balance:' : 'Live Balance:'} <span className="text-white font-semibold">{formatCurrency(availableBalance)}</span>
						</div>
			</div>

			<div className="space-y-3">
				<label className="text-[#e5e7eb] text-sm font-medium">Amount</label>
				<input
					type="number"
					className="w-full bg-[#111827] border border-[#374151] rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
					value={amount}
					min={1}
					onChange={(e) => handleAmountChange(e.target.value)}
				/>
				<div className="flex gap-2">
					{QUICK_AMOUNTS.map((value) => (
						<button
							key={value}
							onClick={() => handleAmountChange(value)}
							className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
								amount === value
									? 'bg-blue-600 text-white'
									: 'bg-[#1f2937] text-[#e5e7eb] hover:bg-[#374151]'
							}`}
							type="button"
						>
							${value}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<label className="text-[#e5e7eb] text-sm font-medium">Duration (seconds)</label>
				<input
					type="number"
					className="w-full bg-[#111827] border border-[#374151] rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
					value={duration}
					min={10}
					step={10}
					onChange={(e) => handleDurationChange(e.target.value)}
				/>
				<div className="flex gap-2 flex-wrap">
					{QUICK_DURATIONS.map((seconds) => (
						<button
							key={seconds}
							onClick={() => handleDurationChange(seconds)}
							className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
								duration === seconds
									? 'bg-blue-600 text-white'
									: 'bg-[#1f2937] text-[#e5e7eb] hover:bg-[#374151]'
							}`}
							type="button"
						>
							{seconds >= 60 ? `${Math.round(seconds / 60)}m` : `${seconds}s`}
						</button>
					))}
				</div>
			</div>

			{feedback?.message && (
				<div
					className={`text-sm border px-3 py-2 rounded-md ${
						feedback.type === 'success'
							? 'bg-[#064e3b] border-[#10b981] text-[#bbf7d0]'
							: 'bg-[#450a0a] border-[#f87171] text-[#fecaca]'
					}`}
				>
					{feedback.message}
				</div>
			)}

			<div className="grid grid-cols-2 gap-3 mt-auto pt-2">
				<button
					onClick={() => executeTrade('SELL')}
					className="bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#7f1d1d] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
					disabled={placing}
					type="button"
				>
					{placing ? (
						<>
							<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							Placing…
						</>
					) : (
						'SELL'
					)}
				</button>
				<button
					onClick={() => executeTrade('BUY')}
					className="bg-[#059669] hover:bg-[#047857] disabled:bg-[#065f46] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
					disabled={placing}
					type="button"
				>
					{placing ? (
						<>
							<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							Placing…
						</>
					) : (
						'BUY'
					)}
				</button>
			</div>

			<div className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-white">Open trades</h3>
					<button
						type="button"
						className="text-xs text-blue-400 hover:text-blue-300"
						onClick={fetchRecentTrades}
					>
						Refresh
					</button>
				</div>
				{recentTrades.length === 0 ? (
					<p className="text-xs text-gray-400">No trades yet. Place a BUY or SELL to get started.</p>
				) : (
					<ul className="space-y-2 text-xs">
						{recentTrades.map((trade) => (
							<li key={trade.id} className="bg-[#0f172a] border border-[#1f2937] rounded-md px-3 py-2">
								<div className="flex justify-between text-white font-medium">
									<span>
										{trade.direction} {trade.symbol}
									</span>
									<span>{formatCurrency(trade.amount)}</span>
								</div>
								<div className="flex justify-between text-gray-400 mt-1">
									<span>Status: {trade.status}</span>
									<span>
										{trade.status === 'open' || trade.status === 'pending'
											? `Expires in ${formatTimeRemaining(trade.timeRemaining)}`
											: trade.closeTime
												? trade.closeTime.toLocaleTimeString()
												: '--'}
									</span>
								</div>
								{trade.profitLoss !== null && (
									<div className="flex justify-between mt-1">
										<span className="text-gray-400">P/L:</span>
										<span className={trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
											{formatCurrency(trade.profitLoss)} ({trade.profitLossPercent?.toFixed(1)}%)
										</span>
									</div>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</aside>
		</>
	);
}

