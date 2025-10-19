"use client";
import React from 'react';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currency';

export default function CurrencySelector({
  value,
  onChange,
  className = '',
  size = 'md',
  showFlag = false,
  disabled = false
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        bg-gray-700 border border-gray-600 rounded-lg text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {Object.entries(CURRENCIES).map(([code, info]) => (
        <option key={code} value={code}>
          {showFlag && info.flag} {info.symbol} {code} - {info.name}
        </option>
      ))}
    </select>
  );
}

// Compact version for headers/navigation
export function CompactCurrencySelector({ value, onChange, disabled = false }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="
        text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white
        focus:outline-none focus:ring-1 focus:ring-blue-500
        disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
      "
    >
      {Object.entries(CURRENCIES).map(([code, info]) => (
        <option key={code} value={code}>
          {info.symbol} {code}
        </option>
      ))}
    </select>
  );
}

// Display component for showing currency with amount
export function CurrencyDisplay({ amount, currency, className = '', showOriginal = false, originalAmount, originalCurrency }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        <span className="font-semibold">
          {getCurrencySymbol(currency)}{Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
      {showOriginal && originalAmount && originalCurrency && originalCurrency !== currency && (
        <div className="text-xs text-gray-500">
          ≈ {getCurrencySymbol(originalCurrency)}{Number(originalAmount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      )}
    </div>
  );
}