// Twelve Data API service
const TWELVE_DATA_API_KEY = 'e6d6b97f027b48fbb233a3e7252eed74';
const BASE_URL = 'https://api.twelvedata.com';

export const realAssets = [
  { 
    symbol: 'AAPL', 
    name: 'Apple Inc', 
    payout: '85%', 
    type: 'stock',
    interval: '1min' 
  },
  { 
    symbol: 'GOOGL', 
    name: 'Google', 
    payout: '82%', 
    type: 'stock',
    interval: '1min' 
  },
  { 
    symbol: 'TSLA', 
    name: 'Tesla', 
    payout: '88%', 
    type: 'stock',
    interval: '1min' 
  },
  { 
    symbol: 'MSFT', 
    name: 'Microsoft', 
    payout: '84%', 
    type: 'stock',
    interval: '1min' 
  },
  { 
    symbol: 'EUR/USD', 
    name: 'Euro/USD', 
    payout: '83%', 
    type: 'forex',
    interval: '1min' 
  },
  { 
    symbol: 'GBP/USD', 
    name: 'Pound/USD', 
    payout: '81%', 
    type: 'forex',
    interval: '1min' 
  },
  { 
    symbol: 'USD/JPY', 
    name: 'USD/Yen', 
    payout: '79%', 
    type: 'forex',
    interval: '1min' 
  },
  { 
    symbol: 'BTC/USD', 
    name: 'Bitcoin', 
    payout: '90%', 
    type: 'crypto',
    interval: '1min' 
  },
  { 
    symbol: 'ETH/USD', 
    name: 'Ethereum', 
    payout: '87%', 
    type: 'crypto',
    interval: '1min' 
  }
];

// Get real-time price
export const getRealTimePrice = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      price: parseFloat(data.price),
      symbol: symbol
    };
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    // Return mock data as fallback
    return {
      price: Math.random() * 1000 + 100,
      symbol: symbol
    };
  }
};

// Get historical data for charts
export const getHistoricalData = async (symbol, interval = '1min', outputsize = 50) => {
  try {
    const response = await fetch(
      `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.values) {
      return data.values.map(item => ({
        time: new Date(item.datetime).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume || 0)
      })).reverse(); // Reverse to get chronological order
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock data as fallback
    return generateMockHistoricalData();
  }
};

// Mock data generator for fallback
const generateMockHistoricalData = () => {
  const data = [];
  const basePrice = Math.random() * 1000 + 100;
  const now = Date.now();
  
  for (let i = 49; i >= 0; i--) {
    const time = now - (i * 60000); // 1 minute intervals
    const variation = (Math.random() - 0.5) * 20;
    const price = basePrice + variation;
    
    data.push({
      time,
      open: price - (Math.random() - 0.5) * 5,
      high: price + Math.random() * 10,
      low: price - Math.random() * 10,
      close: price,
      volume: Math.random() * 1000 + 500
    });
  }
  
  return data;
};

// Get multiple quotes at once
export const getMultipleQuotes = async (symbols) => {
  try {
    const symbolString = symbols.join(',');
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbolString}&apikey=${TWELVE_DATA_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return {};
  }
};
