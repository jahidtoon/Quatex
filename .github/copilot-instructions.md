# Quatex Trading Platform - AI Development Guide

## Architecture Overview

This is a **Next.js 14 trading platform** with a dual-database setup: **Prisma + SQLite** (primary) with empty Supabase client (legacy). The platform features sophisticated financial charting, multi-provider price feeds, and comprehensive admin/user management.

### Key Directories
- `app/` - Next.js App Router with nested layouts (`admin/`, `api/`, trading pages)
- `lib/` - Core services: price feeds, Prisma client, authentication, chart data management
- `components/trading-chart/` - Advanced TradingView-style charting with TypeScript
- `prisma/` - Database schema with comprehensive trading entities (users, trades, currency pairs, etc.)
- `scripts/` - Admin utilities and data seeding tools

## Critical Patterns

### Database & Authentication
- **Prisma is the primary database** (not Supabase). Use `import prisma from '@/lib/prisma'`
- JWT-based auth with bcryptjs hashing. Admin creation: `npm run create:admin -- email password`
- Schema uses `currency_pairs` table with provider mapping (Binance, CoinGecko, AlphaVantage)

### Price Feed Architecture
- **Multi-provider system**: `lib/priceProviders.js` aggregates Forex (primary) + crypto fallbacks
- Internal symbol format: `BASE_QUOTE` (e.g., `EUR_USD`, `BTC_USD`)
- Provider-specific symbols mapped via `provider_symbol` field in database
- Real-time updates through `lib/priceUpdater.js` and candle stores

### Trading Chart System
- **TypeScript-heavy**: `components/trading-chart/CandlestickChart.tsx` (1000+ lines)
- Uses `lightweight-charts` library with custom chart types (candles, bars, line, area, etc.)
- Modular indicators system in `trading-chart/indicators/`
- Drawing tools and visual overlays supported

### Admin Interface
- **Conditional sidebar layout**: `app/admin/layout.js` excludes sidebar on `/admin/login`
- Admin pages use dark theme (`bg-[#0f1320]`) vs main app styling
- Extensive admin modules: users, trades, deposits, withdrawals, analytics

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server (port 3000)
npm run build && npm start     # Production build and run

# Database Operations  
npm run prisma:generate        # Generate Prisma client after schema changes
npm run prisma:migrate         # Create new migration
npm run prisma:studio         # Open database browser
npm run prisma:seed           # Populate with demo data

# Admin Management
npm run create:admin -- user@example.com password123
# Or with env vars: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create:admin
```

## Development Workflows

### Adding New Currency Pairs
1. Insert into `currency_pairs` table with provider mapping
2. Update provider services (`lib/binanceService.js`, `lib/coinGeckoService.js`)
3. Test price feed integration via `scripts/testForexChart.js`

### Chart Feature Development
- Chart components are **TypeScript** - maintain type safety
- New indicators go in `trading-chart/indicators/` with type definitions
- Chart data flows: Provider → PriceFeed → CandleStore → Chart Component

### API Route Patterns
- Use `NextResponse.json()` for API responses
- Consistent error handling with status codes (400, 401, etc.)
- JWT verification in protected routes using `lib/auth.js`

## Production Deployment

- Uses PM2 with `ecosystem.config.js` (currently configured for port 3006)
- Logging to `./logs/` directory (combined, error, output files)
- Environment: `NODE_ENV=production`, `JWT_SECRET` required