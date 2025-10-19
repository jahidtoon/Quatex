# Quatex Trading Platform - AI Development Guide

## Architecture Overview

This is a **Next.js 14 multi-featured trading platform** with Prisma + SQLite (primary database), featuring sophisticated financial charting, multi-provider price feeds, comprehensive admin/user management, P2P trading, tournaments, affiliate programs, and crypto deposit systems.

### Key Directories
- `app/` - Next.js App Router with nested layouts (`admin/`, `api/`, trading, `p2p/`, `tournaments/`, `affiliate/`)
- `lib/` - Core services: price feeds, Prisma client, authentication, chart data, crypto deposits, hot wallet
- `components/trading-chart/` - Advanced TradingView-style charting with TypeScript (2200+ lines)
- `prisma/` - Comprehensive schema with 25+ models: trading, P2P, tournaments, affiliates, crypto deposits
- `scripts/` - Admin utilities, seeding tools, demo data generators, blockchain watchers

## Critical Patterns

### Database & Authentication
- **Prisma is the primary database** (not Supabase). Use `import prisma from '@/lib/prisma'`
- JWT-based auth with bcryptjs hashing. Token verification with fallback support in `lib/auth.js`
- Complex schema with specialized models: `currency_pairs`, `tournament_participants`, `p2p_orders`, `deposit_sessions`
- Admin creation: `npm run create:admin -- email password` or env vars

### Price Feed Architecture
- **Multi-provider system**: `lib/priceProviders.js` intelligently routes Forex (AlphaVantage) vs Crypto (Binance + CoinGecko fallback)
- Internal symbol format: `BASE_QUOTE` (e.g., `EUR_USD`, `BTC_USD`)
- Provider-specific symbols mapped via `provider_symbol` field in database
- Real-time updates through `lib/priceUpdater.js` with separate candle stores

### Advanced Trading Features
- **Complex chart system**: `components/trading-chart/CandlestickChart.tsx` with lightweight-charts integration
- Multiple chart types: candles, bars, line, area, baseline, hollow, heikin-ashi
- Modular indicators system with TypeScript definitions
- Trade tracking with open positions overlay and P&L calculations

### Multi-Module Platform
- **P2P Trading**: Complete escrow system with order matching, payment methods, dispute resolution
- **Tournament System**: Profit-based competitions with entry fees, leaderboards, prize distribution
- **Affiliate Program**: Multi-tier commission structure with referral tracking and payouts
- **Crypto Deposits**: HD wallet derivation with address generation and blockchain monitoring

### Admin Interface Patterns
- **Conditional layout**: `app/admin/layout.js` excludes sidebar on login, collapsible desktop sidebar
- Dark theme styling with mobile-responsive drawer pattern
- Extensive modules: users, trades, deposits, P2P management, tournament oversight, affiliate tracking

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server (port 3000)
npm run build && npm start     # Production build and run
npm run watch:deposits         # Run crypto deposit monitoring

# Database Operations  
npm run prisma:generate        # Generate Prisma client after schema changes
npm run prisma:migrate         # Create new migration
npm run prisma:studio         # Open database browser
npm run prisma:seed           # Populate with demo data

# Admin & Demo Data
npm run create:admin -- user@example.com password123
# Demo generators in scripts/: createDemoUser.js, createDemoTournament.js, seedP2PDemo.js
```

## Development Workflows

### Adding New Features
1. **Database-first**: Update `prisma/schema.prisma` with new models/enums
2. **Generate & migrate**: `npm run prisma:generate && npm run prisma:migrate`
3. **API routes**: Follow `/api/[module]/[action]/route.js` pattern with `NextResponse.json()`
4. **Component integration**: Use existing patterns from `app/[module]/page.jsx`

### Multi-Provider Integration
- **Currency pairs**: Insert into `currency_pairs` with provider mapping (`binance_symbol`, `coingecko_id`)
- **Price services**: Update relevant provider in `lib/` (binanceService.js, coinGeckoService.js, alphaVantage.js)
- **Symbol routing**: Logic in `priceProviders.js` separates forex vs crypto automatically

### Chart & Trading Development
- **TypeScript mandatory** for chart components - maintain strict typing
- Chart data flow: Provider → PriceFeed → CandleStore → Chart Component → Indicators
- New indicators: Create in `trading-chart/indicators/` with proper type definitions
- Trade overlay: Uses `useTradeLines` hook for position visualization

### Crypto & Blockchain Integration
- **Address generation**: `lib/addressGenerator.js` with HD wallet support (BTC, ETH, TRON)
- **Deposit monitoring**: `scripts/watchDeposits.js` runs as PM2 service
- **Wallet ledger**: All balance changes tracked in `wallet_ledger` with `LedgerType` enum

## Production Deployment

- **Dual PM2 services**: Main app (port 3006) + deposit watcher in `ecosystem.config.js`
- **Logging structure**: `./logs/` with separate streams for main app and deposit watcher
- **Required env vars**: `NODE_ENV=production`, `JWT_SECRET`, optional `HD_MNEMONIC` for real crypto addresses
- **Database**: SQLite with connection pooling, consider PostgreSQL for high-volume production