'use client';

// Account types now controlled globally in header; UI selector removed from panel

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth as useAuthState } from '@/lib/AuthContext';

const QUICK_AMOUNTS = [10, 25, 50, 100];
const QUICK_DURATIONS = [30, 60, 120, 300, 600];

function formatCurrency(value) {
	if (value === null || value === undefined || Number.isNaN(value)) return '—';
	try {
		// Use a fixed locale to avoid server/client formatting mismatch during hydration
		return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
	const { user, token, isAuthenticated, updateUser, accountType: globalAccountType, setAccountType: setGlobalAccountType } = useAuthState();
	// Investment state
	const [amount, setAmount] = useState(10); // absolute $ amount
	const [percent, setPercent] = useState(1); // percent mode value (1-100)
	const [amountMode, setAmountMode] = useState('amount'); // 'amount' | 'percent'
	const [duration, setDuration] = useState(60);
	// UI step toggles (purely presentation; core logic unchanged)
	const [amountStepMode, setAmountStepMode] = useState('unit'); // 'unit' | 'ten'
	const [durationStepMode, setDurationStepMode] = useState('sec'); // 'sec' | 'min'

// Display helper: 00:MM:SS for duration
function formatDurationLabel(seconds) {
	const s = Math.max(0, Number(seconds) || 0);
	const mm = Math.floor(s / 60);
	const ss = s % 60;
	return `00:${mm.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`;
}
	const [assets, setAssets] = useState([]);
	const [assetsLoading, setAssetsLoading] = useState(true);
	const [placing, setPlacing] = useState(false);
	const [feedback, setFeedback] = useState({ type: null, message: '' });
	const [recentTrades, setRecentTrades] = useState([]);
	const [accountType, setAccountType] = useState(globalAccountType || 'live');
	const [availableBalance, setAvailableBalance] = useState(() => {
		if (!user) return null;
		return accountType === 'demo' ? Number(user?.demo_balance ?? 10000) : Number(user?.balance ?? 0);
	});
	// Server time clock
	const [serverTime, setServerTime] = useState('—');
	const serverOffsetRef = React.useRef(0);
	// Gate dynamic values to avoid hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	useEffect(() => {
			if (!user) return;
				const val = accountType === 'demo'
					? Number(user.demo_balance ?? 10000)
					: accountType === 'tournament'
						? Number(user.tournament_balance ?? 0)
						: Number(user.balance ?? 0);
			setAvailableBalance(val);
	}, [user, accountType]);

	useEffect(() => {
		// Sync from global account type (header switch)
		if (globalAccountType && globalAccountType !== accountType) {
			setAccountType(globalAccountType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [globalAccountType]);

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

	// Fetch server time once and keep a ticking client-side clock synced by offset
	useEffect(() => {
		let timer;
		let resync;
		const sync = async () => {
			try {
				const t0 = Date.now();
				const res = await fetch('/api/time', { cache: 'no-store' });
				const t1 = Date.now();
				const json = await res.json();
				const rtt = (t1 - t0) / 2;
				const srv = Number(json?.now ?? Date.parse(json?.iso));
				serverOffsetRef.current = Number.isFinite(srv) ? (srv + rtt - t1) : 0;
			} catch {
				serverOffsetRef.current = 0;
			}
		};
		const tick = () => {
			const now = new Date(Date.now() + serverOffsetRef.current);
			const hh = now.getHours().toString().padStart(2, '0');
			const mm = now.getMinutes().toString().padStart(2, '0');
			const ss = now.getSeconds().toString().padStart(2, '0');
			setServerTime(`${hh}:${mm}:${ss}`);
		};
		sync().then(() => {
			tick();
			timer = setInterval(tick, 1000);
		});
		resync = setInterval(sync, 60_000);
		return () => { clearInterval(timer); clearInterval(resync); };
	}, []);

	const selectedAssetInfo = useMemo(() => assets.find((asset) => asset.symbol === selectedAsset), [assets, selectedAsset]);

	const handleAmountChange = (value) => {
		const numeric = Number(value);
		if (Number.isNaN(numeric)) return;
		if (amountMode === 'amount') {
			setAmount(Math.max(1, Math.round(numeric)));
		} else {
			setPercent(Math.min(100, Math.max(1, Math.round(numeric))));
		}
	};

	const handleDurationChange = (value) => {
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			setDuration(Math.min(24 * 60 * 60, Math.max(10, Math.round(numeric))));
		}
	};

	const stepAmount = (dir) => {
		const step = amountStepMode === 'ten' ? 10 : 1;
		if (amountMode === 'amount') {
			const next = Math.max(1, (amount || 0) + (dir === 'dec' ? -step : step));
			setAmount(next);
		} else {
			const next = Math.min(100, Math.max(1, (percent || 0) + (dir === 'dec' ? -step : step)));
			setPercent(next);
		}
	};

	// Compute effective $ amount based on current mode and available balance
	const effectiveAmount = useMemo(() => {
		if (amountMode === 'amount') return Number(amount) || 0;
		const bal = Number(availableBalance);
		if (!Number.isFinite(bal) || bal <= 0) return 0;
		return Number(((bal * (Number(percent) || 0)) / 100).toFixed(2));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amount, percent, amountMode, availableBalance]);

	const stepDuration = (dir) => {
		const step = durationStepMode === 'min' ? 60 : 10;
		const next = Math.min(24 * 60 * 60, Math.max(10, (duration || 0) + (dir === 'dec' ? -step : step)));
		setDuration(next);
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

		const tradeAmount = Number(effectiveAmount);
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
						// expose client-side mode for analytics/debug (server may ignore)
						investmentMode: amountMode,
						investmentPercent: amountMode === 'percent' ? percent : undefined,
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
			{/* Right trade panel */}
			<aside className="w-full md:w-72 xl:w-64 2xl:w-60 flex-shrink-0 bg-[#0f1320] border-l border-[#1f2937] p-4 flex flex-col gap-4 min-h-0 max-h-full overflow-y-auto min-w-[260px]">
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
						<div className="text-green-400 text-xl font-bold" suppressHydrationWarning>
							{mounted && currentPrice ? formatCurrency(currentPrice) : '—'}
						</div>
					</div>
				</div>

				{/* Market selector removed per request; panel now follows chart selection */}

				<div className="flex justify-between text-xs text-gray-400">
					<span>Type: {selectedAssetInfo?.type || '—'}</span>
					<span>Payout: {selectedAssetInfo?.payout ? `${selectedAssetInfo.payout}%` : '—'}</span>
				</div>

						<div className="bg-[#0f172a] rounded-md px-3 py-2 border border-[#1f2937] text-sm text-gray-300">
							{accountType === 'demo' ? 'Demo Balance:' : accountType === 'tournament' ? 'Tournament Balance:' : 'Live Balance:'} <span className="text-white font-semibold" suppressHydrationWarning>{mounted ? formatCurrency(availableBalance) : '—'}</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-gray-300">
							<span className="inline-flex items-center gap-1 bg-[#0f172a] border border-[#1f2937] rounded px-2 py-1" title="Server Time (HH:MM:SS)" suppressHydrationWarning>
								<span>🕒</span>
								<span>{mounted ? serverTime : '—'}</span>
							</span>
						</div>
			</div>

			{/* Investment stepper */}
			<div className="space-y-2 bg-[#111827] rounded-lg p-3 border border-[#374151]">
				<div className="flex items-center justify-between">
					<div className="text-[#9ca3af] text-xs uppercase tracking-wide">Investment</div>
					{/* $/% mode switch */}
					<div className="grid grid-cols-2 text-xs rounded-md overflow-hidden border border-[#374151]">
						<button type="button" onClick={() => setAmountMode('amount')} className={`px-2 py-1 ${amountMode==='amount' ? 'bg-[#0f172a] text-white' : 'bg-transparent text-gray-300'}`}>$</button>
						<button type="button" onClick={() => setAmountMode('percent')} className={`px-2 py-1 ${amountMode==='percent' ? 'bg-[#0f172a] text-white' : 'bg-transparent text-gray-300'}`}>%</button>
					</div>
				</div>
				<div className="flex items-center justify-between gap-2">
					<button type="button" onClick={() => stepAmount('dec')} className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#374151] text-white flex items-center justify-center">
						<i className="fas fa-minus" />
					</button>
					<div className="flex-1 text-center">
						<input
							type="number"
							value={amountMode === 'amount' ? amount : percent}
							onChange={(e) => handleAmountChange(e.target.value)}
							className="w-full bg-transparent text-white font-semibold text-lg text-center border-none outline-none"
							min={amountMode === 'amount' ? 1 : 1}
							max={amountMode === 'amount' ? undefined : 100}
							step={amountStepMode === 'ten' ? 10 : 1}
						/>
						{amountMode === 'percent' && (
							<div className="text-[11px] text-gray-400" suppressHydrationWarning>
								≈ {mounted ? formatCurrency(effectiveAmount) : '—'}
							</div>
						)}
					</div>
					<button type="button" onClick={() => stepAmount('inc')} className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#374151] text-white flex items-center justify-center">
						<i className="fas fa-plus" />
					</button>
				</div>
				<div className="flex items-center justify-between">
					<button type="button" onClick={() => setAmountStepMode((m) => (m === 'unit' ? 'ten' : 'unit'))} className="text-[11px] text-blue-400 hover:text-blue-300">
						STEP ({amountStepMode === 'unit' ? '±1' : '±10'})
					</button>
					{amountMode === 'percent' && (
						<div className="text-[11px] text-gray-400">of balance</div>
					)}
				</div>
			</div>

			{/* Time stepper */}
			<div className="space-y-2 bg-[#111827] rounded-lg p-3 border border-[#374151]">
				<div className="text-[#9ca3af] text-xs uppercase tracking-wide">Time</div>
				<div className="flex items-center justify-between gap-2">
					<button type="button" onClick={() => stepDuration('dec')} className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#374151] text-white flex items-center justify-center">
						<i className="fas fa-minus" />
					</button>
					<div className="flex-1 text-center">
						<input
							type="number"
							value={duration}
							onChange={(e) => handleDurationChange(e.target.value)}
							className="w-full bg-transparent text-white font-semibold text-lg font-mono text-center border-none outline-none"
							min={10}
							max={86400}
							step={durationStepMode === 'min' ? 60 : 10}
						/>
					</div>
					<button type="button" onClick={() => stepDuration('inc')} className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#374151] text-white flex items-center justify-center">
						<i className="fas fa-plus" />
					</button>
				</div>
				<button type="button" onClick={() => setDurationStepMode((m)=> (m==='sec'?'min':'sec'))} className="text-[11px] text-blue-400 hover:text-blue-300">
					SWITCH TIME ({durationStepMode === 'sec' ? '±10s' : '±1m'})
				</button>
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

			{/* Action buttons */}
			<div className="grid grid-rows-2 gap-3 mt-auto pt-2">
				{/* BUY (UP) on top */}
				<button
					onClick={() => executeTrade('BUY')}
					className="w-full bg-[#059669] hover:bg-[#047857] disabled:bg-[#065f46] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
					disabled={placing}
					type="button"
				>
					{placing ? (
						<>
							<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							Placing…
						</>
					) : (
						'UP'
					)}
				</button>
				{/* SELL (DOWN) below */}
				<button
					onClick={() => executeTrade('SELL')}
					className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-[#7f1d1d] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
					disabled={placing}
					type="button"
				>
					{placing ? (
						<>
							<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							Placing…
						</>
					) : (
						'DOWN'
					)}
				</button>
			</div>

			{/* Payout info under buttons (mirroring reference UI) */}
			{(() => {
				const pct = Number(selectedAssetInfo?.payout ?? 0);
				const payout = pct > 0 ? (effectiveAmount * pct) / 100 : null;
				return (
					<div className="text-center text-xs text-gray-300" suppressHydrationWarning>
						Your payout: {mounted && payout != null ? `${formatCurrency(payout)}` : '—'}
					</div>
				);
			})()}

			<div className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-white">Trades <span className="text-gray-400" suppressHydrationWarning>{mounted ? recentTrades.length : 0}</span></h3>
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

