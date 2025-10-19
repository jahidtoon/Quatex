"use client";
import React, { useRef, useState } from 'react';
import { getPairIcon, displayName } from './iconUtils';

// Lightweight flag helper for major fiat; fallback to base letters
function flagForPair(symbol, type) {
  try {
    if (!symbol) return '📈';
    if (type === 'CRYPTO') return '🪙';
    const clean = symbol.replace(/[-:]/g, '_');
    const [base] = clean.includes('_') ? clean.split('_') : [clean.slice(0, 3)];
    const FLAGS = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿',
      BRL: '🇧🇷', IDR: '🇮🇩', PKR: '🇵🇰', ZAR: '🇿🇦', NGN: '🇳🇬', INR: '🇮🇳', CNY: '🇨🇳'
    };
    return FLAGS[base] || '💱';
  } catch {
    return '📊';
  }
}

export default function TopPairsTabs({
  pairs = [], // [{ symbol, display, payout, type }]
  selected,
  onSelect,
  onClose,
  onOpenSelector,
}) {
  const scrollRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const suppressClick = useRef(false);

  const beginDrag = (clientX) => {
    const el = scrollRef.current;
    if (!el) return;
    setDragging(true);
    startX.current = clientX;
    startScrollLeft.current = el.scrollLeft;
    suppressClick.current = false;
  };

  const dragTo = (clientX) => {
    const el = scrollRef.current;
    if (!el || !dragging) return;
    const dx = clientX - startX.current;
    if (Math.abs(dx) > 3) suppressClick.current = true; // threshold to treat as drag
    el.scrollLeft = startScrollLeft.current - dx;
  };

  const endDrag = () => {
    setDragging(false);
    // allow click suppression to be consumed once
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  return (
    <div className="w-full bg-[#0b0f16] border-b border-[#1f2937]">
      <div
        ref={scrollRef}
        className={`no-scrollbar flex items-center gap-2 px-2 py-2 overflow-x-auto select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={(e) => beginDrag(e.clientX)}
        onMouseMove={(e) => dragTo(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => beginDrag(e.touches?.[0]?.clientX || 0)}
        onTouchMove={(e) => dragTo(e.touches?.[0]?.clientX || 0)}
        onTouchEnd={endDrag}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <button
          onClick={onOpenSelector}
          className="flex items-center gap-2 bg-[#0f172a] text-white/80 hover:text-white border border-[#253041] hover:border-[#3a4a60] px-3 py-1.5 rounded-md whitespace-nowrap"
        >
          <span className="text-lg">＋</span>
          <span className="text-sm">Select trade pair</span>
        </button>

        {pairs.map((p) => {
          const active = p.symbol === selected;
          return (
            <div
              key={p.symbol}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border whitespace-nowrap ${
                active ? 'bg-[#111827] border-[#334155] text-white' : 'bg-[#0f172a] border-[#253041] text-white/80 hover:text-white'
              }`}
            >
              <button
                onClick={() => onSelect && onSelect(p.symbol)}
                className="flex items-center gap-2 focus:outline-none"
                title={p.display || p.symbol}
              >
                  <span className="inline-flex items-center">{getPairIcon(p.symbol, p.type, 16)}</span>
                  <span className="text-sm font-semibold">{displayName(p.display || p.symbol)}</span>
                {typeof p.payout === 'number' && (
                  <span className="text-xs text-yellow-300 bg-yellow-300/10 border border-yellow-300/20 px-1.5 py-0.5 rounded">{Math.round(p.payout)}%</span>
                )}
              </button>
              <button
                onClick={() => onClose && onClose(p.symbol)}
                className="ml-1 text-white/40 hover:text-white"
                aria-label={`Close ${p.display || p.symbol}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
