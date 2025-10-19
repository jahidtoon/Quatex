// Currency conversion utilities

// Available currencies with their symbols and names
export const CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' }
};

// Format currency amount with proper symbol and decimals
export function formatCurrency(amount, currency = 'USD', options = {}) {
  const currencyInfo = CURRENCIES[currency] || { symbol: currency, name: currency };
  const numAmount = Number(amount || 0);

  if (!Number.isFinite(numAmount)) return `${currencyInfo.symbol}0.00`;

  const { minimumFractionDigits = 2, maximumFractionDigits = 2, showSymbol = true } = options;

  const formatted = numAmount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return showSymbol ? `${currencyInfo.symbol}${formatted}` : formatted;
}

// Get currency symbol
export function getCurrencySymbol(currency) {
  return CURRENCIES[currency]?.symbol || currency;
}

// Get currency name
export function getCurrencyName(currency) {
  return CURRENCIES[currency]?.name || currency;
}

// Convert amount from one currency to another
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1 };
  }

  try {
    const response = await fetch('/api/currency/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amount
      })
    });

    if (!response.ok) {
      throw new Error('Currency conversion failed');
    }

    const data = await response.json();
    return {
      convertedAmount: data.converted_amount,
      rate: data.rate,
      limits: data.limits
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback: return original amount if conversion fails
    return { convertedAmount: amount, rate: 1, error: true };
  }
}

// Get all available currency rates
export async function getCurrencyRates() {
  try {
    const response = await fetch('/api/currency/convert');
    if (!response.ok) {
      throw new Error('Failed to fetch currency rates');
    }
    const data = await response.json();
    return data.rates || [];
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return [];
  }
}

// Calculate display amount based on user's preferred currency
export async function getDisplayAmount(amount, userCurrency = 'USD', baseCurrency = 'USD') {
  if (userCurrency === baseCurrency) {
    return { displayAmount: amount, currency: userCurrency };
  }

  const conversion = await convertCurrency(amount, baseCurrency, userCurrency);
  return {
    displayAmount: conversion.convertedAmount,
    currency: userCurrency,
    originalAmount: amount,
    originalCurrency: baseCurrency,
    rate: conversion.rate
  };
}