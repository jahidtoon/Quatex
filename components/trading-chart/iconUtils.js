// Lightweight icon resolver for pairs: crypto logos via CoinGecko assets
// and forex flags via flagcdn. No keys required.

const COINGECKO = 'https://assets.coingecko.com/coins/images';

// Common coin base -> coingecko image path (large)
const COIN_ICON = {
  BTC: `${COINGECKO}/1/large/bitcoin.png`,
  ETH: `${COINGECKO}/279/large/ethereum.png`,
  BNB: `${COINGECKO}/825/large/binance-coin-logo.png`,
  SOL: `${COINGECKO}/4128/large/solana.png`,
  XRP: `${COINGECKO}/44/large/xrp-symbol-white-128.png`,
  ADA: `${COINGECKO}/975/large/cardano.png`,
  DOGE: `${COINGECKO}/5/large/dogecoin.png`,
  TRX: `${COINGECKO}/1094/large/tron-logo.png`,
  MATIC: `${COINGECKO}/4713/large/matic-token-icon.png`,
  DOT: `${COINGECKO}/12171/large/polkadot.png`,
  LTC: `${COINGECKO}/2/large/litecoin.png`,
  LINK: `${COINGECKO}/877/large/chainlink-new-logo.png`,
  SHIB: `${COINGECKO}/11939/large/shiba.png`,
  AVAX: `${COINGECKO}/12559/large/coin-round-red.png`,
  OP: `${COINGECKO}/25244/large/Optimism.png`,
  ARB: `${COINGECKO}/16547/large/arb.jpg`,
  BUSD: `${COINGECKO}/9576/large/BUSD.png`,
  USDT: `${COINGECKO}/325/large/Tether-logo.png`,
  USDC: `${COINGECKO}/6319/large/USD_Coin_icon.png`,
  SOLANA: `${COINGECKO}/4128/large/solana.png`,
};

// Currency to ISO country for flags (flagcdn)
const CC = {
  USD: 'us', EUR: 'eu', GBP: 'gb', JPY: 'jp', CHF: 'ch', AUD: 'au', CAD: 'ca', NZD: 'nz',
  BRL: 'br', IDR: 'id', PKR: 'pk', ZAR: 'za', NGN: 'ng', INR: 'in', CNY: 'cn', TRY: 'tr', RUB: 'ru', MXN: 'mx', SEK: 'se', NOK: 'no', DKK: 'dk', PLN: 'pl', HUF: 'hu', CZK: 'cz', SGD: 'sg', HKD: 'hk'
};

const flagUrl = (code, size = 24) => `https://flagcdn.com/${size}/${code}.png`;

function parseSymbol(symbol) {
  if (!symbol) return { base: '', quote: '' };
  const s = symbol.replace(/[-:]/g, '_');
  if (s.includes('/')) {
    const [b, q] = s.split('/');
    return { base: b.toUpperCase(), quote: q.toUpperCase() };
  }
  if (s.includes('_')) {
    const [b, q] = s.split('_');
    return { base: b.toUpperCase(), quote: q.toUpperCase() };
  }
  if (/^[A-Z]{6,}$/.test(s)) {
    return { base: s.slice(0, 3).toUpperCase(), quote: s.slice(3, 6).toUpperCase() };
  }
  return { base: s.toUpperCase(), quote: '' };
}

export function getPairIcon(symbol, type, size = 16) {
  const { base, quote } = parseSymbol(symbol || '');
  const isCrypto = (type || '').toUpperCase() === 'CRYPTO' || (!symbol?.includes('_') && !!quote);
  const box = { width: size, height: size, borderRadius: '50%', background: 'transparent', display: 'inline-block' };

  if (isCrypto) {
    const key = base in COIN_ICON ? base : (quote in COIN_ICON ? quote : null);
    if (key) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={COIN_ICON[key]} alt={key} width={size} height={size} style={box} loading="lazy" />;
    }
    return <span style={{ ...box, background: '#f59e0b', display: 'inline-grid', placeItems: 'center', color: '#111', fontSize: size * 0.6 }}>₿</span>;
  }

  // Forex: show two flags side by side
  const fb = CC[base] || 'un';
  const fq = CC[quote] || 'un';
  const w = Math.round(size * 1.8);
  const gap = Math.max(1, Math.floor(size * 0.1));
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={flagUrl(fb, 24)} alt={base} width={size} height={size} style={{ borderRadius: '50%' }} loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={flagUrl(fq, 24)} alt={quote} width={size} height={size} style={{ borderRadius: '50%' }} loading="lazy" />
    </span>
  );
}

export function displayName(symbol) {
  if (!symbol) return '';
  return symbol.replace('_', '/').replace('USDT', '/USDT');
}
