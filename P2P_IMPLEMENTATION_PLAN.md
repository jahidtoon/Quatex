# Quatex P2P Trading – Full Implementation Plan (Bangla)

এই ডকুমেন্টে Quatex প্ল্যাটফর্মে P2P ট্রেডিং মডিউল শূন্য থেকে প্রোডাকশন-রেডি করার সম্পূর্ণ পরিকল্পনা দেওয়া হলো: আর্কিটেকচার, ডাটামডেল (Prisma), API, এসক্রো/লেজার ফ্লো, নিরাপত্তা, UI, অ্যাডমিন, টেস্টিং ও রোলআউট।

## 0) বর্তমান অবস্থা (অডিট সারাংশ)
- Frontend:
  - `app/p2p/page.jsx` – একটি প্রাথমিক স্ট্যাটিক/ডেমো পেজ আছে (অফার কার্ড ইত্যাদি), তবে ব্যাকএন্ড ইন্টেগ্রেশন নেই।
  - Sidebar/Navigation-এ P2P লিংক ও প্লেসহোল্ডার UI আছে।
- Backend/DB:
  - Prisma + SQLite (primary). `schema.prisma`-এ P2P-সংশ্লিষ্ট কোনো টেবিল এখনো নেই।
  - বিদ্যমান আর্থিক কম্পোনেন্ট: `wallet_ledger` (DEPOSIT/WITHDRAWAL/ADJUST), `crypto_assets`, `deposit_sessions` (ক্রিপ্টো ডিপোজিট), `users.balance` (সম্ভবত USD-লাইক ব্যালেন্স)।
- Auth:
  - JWT-based (`lib/auth.js`), অ্যাডমিন/ইউজার রোল বিদ্যমান।

=> P2P মডিউল আনতে নতুন Prisma মডেল, API রুট, লেজার টাইপ, UI ও অ্যাডমিন টুল প্রয়োজন।

## 1) স্কোপ ও মূল ধারণা
- লক্ষ্য: ইউজার-টু-ইউজার (fiat ⇄ crypto) ট্রেডিং যেখানে প্ল্যাটফর্ম "ক্রিপ্টো এসক্রো" ধরে রাখে।
- Asset: শুরুতে USDT-TRC20 (TRON) ও BTC, পরে কনফিগারেবল।
- Fiat: প্রাথমিকভাবে BDT (পরবর্তীতে বহু ফিয়াট সাপোর্টযোগ্য)।
- Offer/Order:
  - Maker (অফার তৈরি করে): Buy বা Sell অফার পোস্ট করতে পারে।
  - Taker (অফারে অর্ডার করে): অফার সিলেক্ট করে অর্ডার ওপেন করে।
- Escrow:
  - Seller যে ক্রিপ্টো বিক্রি করছে, সেই ক্রিপ্টো অর্ডার ওপেনের সাথে সাথেই এসক্রোতে হোল্ড হয়।
  - Buyer fiat পেমেন্ট কনফার্ম করলে Seller রিলিজ করে; বিরোধ হলে অ্যাডমিন ডিসাইড করে।

## 2) ডাটা মডেল (Prisma)
নিচের নতুন টেবিল/এনাম যুক্ত হবে। নোট: এটি পরিকল্পনার স্কিমা; মাইগ্রেশন ধাপে ফাইনটিউন হতে পারে।

Enums:
- P2POrderSide: BUY | SELL
- P2POfferStatus: ACTIVE | PAUSED | CLOSED
- P2PTradeStatus: PENDING | WAITING_PAYMENT | PAID | ESCROW_HELD | RELEASED | CANCELED | DISPUTED | REFUNDED | EXPIRED
- P2PDisputeStatus: OPEN | RESOLVED | CANCELED
- PaymentMethodType: BKASH | NAGAD | BANK | CARDBANK | OTHERS (কনফিগারেবল)

Ledger enum update:
- LedgerType (existing) তে নতুন টাইপ যোগ প্রস্তাব: P2P_ESCROW_HOLD, P2P_ESCROW_RELEASE, P2P_ESCROW_REFUND, P2P_FEE
  - বিকল্প: আলাদা enum/টেবিল না করে `wallet_ledger.type` এই ভ্যালুগুলোতে এক্সটেন্ড করা।

Models (high-level):
- p2p_offers
  - id, user_id (maker)
  - side (BUY/SELL)
  - asset_symbol (e.g., "USDT") and optional crypto_asset_id → `crypto_assets`
  - fiat_currency (e.g., "BDT")
  - price_type: FIXED | FLOATING
  - fixed_price?: Decimal (fiat per 1 unit asset)
  - margin_percent?: Decimal (FLOATING হলে reference price ± margin)
  - min_amount_asset, max_amount_asset (ক্রিপ্টো ইউনিটে)
  - min_limit_fiat, max_limit_fiat
  - terms, auto_reply, status (ACTIVE/PAUSED/CLOSED)
  - completion stats: total_trades, completion_rate
  - created_at, updated_at

- user_payment_methods
  - id, user_id
  - type (enum PaymentMethodType)
  - label
  - details (Json – masked fields e.g., account/phone)
  - is_verified (Bool)
  - is_active (Bool)
  - created_at, updated_at

- p2p_offer_payment_methods (join)
  - id, offer_id, payment_method_id

- p2p_orders
  - id, offer_id, maker_id, taker_id
  - side (BUY/SELL – অফারের সাইড, রেফারেন্স)
  - asset_symbol, fiat_currency
  - price (deal price at order time)
  - amount_asset, amount_fiat
  - status (P2PTradeStatus)
  - escrow_held (Bool), escrow_ledger_id (optional)
  - expires_at, paid_at, released_at, canceled_at
  - reference_code (human-friendly), meta Json
  - created_at, updated_at
  - Index: maker_id, taker_id, status

- p2p_messages
  - id, order_id, sender_id, message, attachments Json?, created_at

- p2p_disputes
  - id, order_id, raised_by_user_id, reason, description, status
  - resolved_by_admin_id?, resolution_note?, resolved_at
  - attachments Json?, created_at, updated_at

- p2p_ratings
  - id, order_id, from_user_id, to_user_id, stars (1-5), comment, created_at

নোট: `wallet_ledger`-এ P2P লেনদেন ট্যাগিংয়ের জন্য meta: { orderId, escrow: true } রাখা হবে।

## 3) এসক্রো/লেজার ফ্লো
- Available balance (asset-wise): SUM(wallet_ledger where user_id=U and asset=S and type != P2P_ESCROW_HOLD) – SUM(holds)
- Order create (offer.side = SELL):
  1) Validate seller available >= amount_asset
  2) Create ledger: type=P2P_ESCROW_HOLD, user=seller, asset=ASSET, amount=amount_asset (ডেবিট/নেগেটিভ হিসেবে গণ্য)
  3) Order.status = ESCROW_HELD
- Buyer mark paid:
  - Order.status = PAID, paid_at=now
- Seller release:
  1) Create ledger: type=P2P_ESCROW_RELEASE, user=buyer, amount=amount_asset (ক্রেডিট)
  2) Optionally fee: type=P2P_FEE, user=seller, amount=fee_asset
  3) Close hold (no-op if using single-entry), অথবা meta.escrowReleased=true
  4) Order.status = RELEASED, released_at=now
- Cancel (Auto/Manual):
  - If hold exists and not released: refund to seller via marking hold as released back → either delete hold (not recommended) বা create counter ledger type P2P_ESCROW_REFUND to seller.
- Dispute:
  - Order.status = DISPUTED, admin resolves → RELEASED বা REFUNDED path অনুযায়ী ledger পোস্ট হবে।

## 4) প্রাইসিং/রেট সোর্স
- FLOATING হলে price = reference_price(asset, fiat) * (1 + margin_percent/100)
- Reference price sources: `lib/priceProviders.js` (ইতিমধ্যে multi-provider) – Fiat rate-এর জন্য USD→BDT কনভার্সন প্রয়োগ (simple config)।

## 5) API ডিজাইন (Next.js App Router, `app/api/p2p/*`)
Protected routes: JWT

Offers
- GET /api/p2p/offers?asset=USDT&fiat=BDT&side=SELL&page=1&pageSize=20&sort=rate
- POST /api/p2p/offers { side, asset_symbol, fiat_currency, price_type, fixed_price?, margin_percent?, min_amount_asset, max_amount_asset, min_limit_fiat, max_limit_fiat, terms, payment_method_ids[] }
- PATCH /api/p2p/offers/:id { ...updates }
- POST /api/p2p/offers/:id/pause
- POST /api/p2p/offers/:id/resume

Payment Methods
- GET /api/p2p/payment-methods (my)
- POST /api/p2p/payment-methods { type, label, details }
- PATCH /api/p2p/payment-methods/:id { ... }
- DELETE /api/p2p/payment-methods/:id

Orders
- POST /api/p2p/orders { offer_id, amount_asset OR amount_fiat }
  - If offer.side=SELL → hold escrow immediately → status=ESCROW_HELD
  - If offer.side=BUY → no escrow (buyer will send fiat?); সাধারণত P2P-তে SELL অফার বেশি প্রচলিত।
- GET /api/p2p/orders?role=maker|taker&status=...
- GET /api/p2p/orders/:id
- POST /api/p2p/orders/:id/mark-paid
- POST /api/p2p/orders/:id/release (2FA optional)
- POST /api/p2p/orders/:id/cancel

Chat & Disputes & Ratings
- GET /api/p2p/orders/:id/messages
- POST /api/p2p/orders/:id/messages { message }
- POST /api/p2p/orders/:id/dispute { reason, description }
- POST /api/p2p/orders/:id/rate { stars, comment }

Admin
- GET /api/admin/p2p/disputes
- POST /api/admin/p2p/disputes/:id/resolve { decision: RELEASE|REFUND, note }
- POST /api/admin/p2p/offers/:id/ban

## 6) ফ্রন্টএন্ড UI/পেজ প্ল্যান
Pages/Routes
- /p2p – মার্কেটপ্লেস (ফিল্টার: asset, fiat, side, payment method, min/max, sort)
- /p2p/create-offer – অফার ক্রিয়েশন ফর্ম
- /p2p/orders – আমার অর্ডার লিস্ট (tabs: active, completed, canceled, disputed)
- /p2p/order/[id] – চ্যাট + অ্যাকশন (mark paid, release, cancel, dispute)
- /p2p/settings/payment-methods – ইউজারের পেমেন্ট মেথড CRUD
- /admin/p2p/disputes – ডিসপিউট রিভিউ/রিজলভ

Components
- OfferCard, OfferFilters, CreateOfferForm
- OrderRow, OrderDetailPanel, PaymentMethodBadge
- ChatPanel (polling/SSE; ভবিষ্যতে WebSocket)

UX Rules
- Auto-cancel টাইমআউট (e.g., 15m) হলে hold refund
- Big actions require confirmation modal + optional 2FA

## 7) নিরাপত্তা, রিস্ক & কমপ্লায়েন্স
- KYC: P2P ফিচার অন করার আগে `users.is_verified=true` লাগবে (configurable gate)
- Limits: daily trade limit, per-order min/max, unverified users cap
- 2FA (optional): Release action এ 2FA (OTP) সাপোর্ট
- Audit log: গুরুত্বপূর্ণ অ্যাকশনের লগ (release/cancel/dispute) সংরক্ষণ
- Rate limit: order create, messages, dispute তৈরি
- Moderation: terms/auto-reply কনটেন্ট ফিল্টার (basic)

## 8) ফি/রেভিনিউ মডেল
- Maker বা Taker এর কাছ থেকে fee_asset (e.g., USDT) এ শতাংশ ফি
- Fee posting: P2P_FEE ledger এ বুক হবে (to seller/taker per policy)
- Admin reporting: দৈনিক fee summary

## 9) মাইগ্রেশন পরিকল্পনা (ধাপে ধাপে)
1) Enums আপডেট: LedgerType-এ P2P_* টাইপগুলো add
2) নতুন টেবিল: p2p_offers, user_payment_methods, p2p_offer_payment_methods
3) p2p_orders, p2p_messages, p2p_disputes, p2p_ratings
4) Indexes & constraints
5) Seed data: demo users, balances (wallet_ledger), sample offers

Runbook (dev):
- prisma migrate dev → prisma generate → prisma seed

## 10) ইন্টিগ্রেশন পয়েন্টস
- Auth: `lib/auth.js` (JWT) – API রুট গার্ড
- DB: `lib/prisma.js` – Prisma ক্লায়েন্ট
- Rates: `lib/priceProviders.js` – asset price; fiat কনভার্টার utility যুক্ত করা হবে
- Ledger: `lib/hotWallet.js` নয়; P2P এসক্রো purely internal ledger-level (off-chain) হিসেবে থাকবে

## 11) টেস্টিং স্ট্র্যাটেজি
Unit
- Price calc (fixed/floating), balance/available, escrow hold/release math
- Order lifecycle transitions & guards

Integration
- Offer create → list → update → pause/resume
- Order create (with hold) → mark-paid → release (fee applied)
- Cancel path (auto/manual) → refund
- Dispute open → admin resolve

E2E (scripted)
- seed → two users → top-up balances → place order → happy path → verify ledgers & statuses

## 12) রোলআউট প্ল্যান
- Phase 1: Dev DB (SQLite) – feature flag দিয়ে internal testing
- Phase 2: Staging (SQLite/Postgres) – limited beta
- Phase 3: Production – PM2 ecosystem, logs, alerting
- Monitoring: dispute volume, cancel rate, average time-to-release

## 13) ব্যাকলগ/ভবিষ্যৎ উন্নয়ন
- WebSocket chat, real-time order updates
- Advanced reputation system (weighted rating, completion rate decay)
- On-chain escrow (optional, later)
- Multi-fiat FX rates with provider redundancy
- Mobile-first UX improvements

---

## Appendix A) Prisma স্কিমা খসড়া (সংশোধনযোগ্য)

নিচে একটি সম্ভাব্য স্কিমা ড্রাফট দেওয়া হলো (প্রোডাকশনে দেয়ার আগে রিভিউ/টেস্ট জরুরি):

```prisma
enum P2POrderSide {
  BUY
  SELL
}

enum P2POfferStatus {
  ACTIVE
  PAUSED
  CLOSED
}

enum P2PTradeStatus {
  PENDING
  WAITING_PAYMENT
  PAID
  ESCROW_HELD
  RELEASED
  CANCELED
  DISPUTED
  REFUNDED
  EXPIRED
}

enum P2PDisputeStatus {
  OPEN
  RESOLVED
  CANCELED
}

enum PaymentMethodType {
  BKASH
  NAGAD
  BANK
  CARDBANK
  OTHERS
}

// Extend existing enum LedgerType
// add: P2P_ESCROW_HOLD, P2P_ESCROW_RELEASE, P2P_ESCROW_REFUND, P2P_FEE

model p2p_offers {
  id                 String          @id @default(uuid())
  user_id            String
  side               P2POrderSide
  asset_symbol       String
  crypto_asset_id    String?
  fiat_currency      String
  price_type         String          // FIXED or FLOATING
  fixed_price        Decimal?
  margin_percent     Decimal?
  min_amount_asset   Decimal
  max_amount_asset   Decimal
  min_limit_fiat     Decimal
  max_limit_fiat     Decimal
  terms              String?
  auto_reply         String?
  status             P2POfferStatus  @default(ACTIVE)
  total_trades       Int             @default(0)
  completion_rate    Int             @default(100) // percent
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt

  users              users           @relation(fields: [user_id], references: [id])
  payment_methods    p2p_offer_payment_methods[]
  orders             p2p_orders[]

  @@index([user_id])
  @@index([status])
  @@index([asset_symbol, fiat_currency, side])
}

model user_payment_methods {
  id          String             @id @default(uuid())
  user_id     String
  type        PaymentMethodType
  label       String?
  details     Json?
  is_verified Boolean            @default(false)
  is_active   Boolean            @default(true)
  created_at  DateTime           @default(now())
  updated_at  DateTime           @updatedAt

  users       users              @relation(fields: [user_id], references: [id])
  offers      p2p_offer_payment_methods[]

  @@index([user_id])
  @@index([type])
}

model p2p_offer_payment_methods {
  id                 String               @id @default(uuid())
  offer_id           String
  payment_method_id  String

  offer              p2p_offers           @relation(fields: [offer_id], references: [id])
  payment_method     user_payment_methods @relation(fields: [payment_method_id], references: [id])

  @@unique([offer_id, payment_method_id])
}

model p2p_orders {
  id             String          @id @default(uuid())
  offer_id       String
  maker_id       String
  taker_id       String
  side           P2POrderSide
  asset_symbol   String
  fiat_currency  String
  price          Decimal
  amount_asset   Decimal
  amount_fiat    Decimal
  status         P2PTradeStatus  @default(PENDING)
  escrow_held    Boolean         @default(false)
  escrow_ledger_id String?
  reference_code String?
  meta           Json?
  expires_at     DateTime?
  paid_at        DateTime?
  released_at    DateTime?
  canceled_at    DateTime?
  created_at     DateTime        @default(now())
  updated_at     DateTime        @updatedAt

  offer          p2p_offers      @relation(fields: [offer_id], references: [id])
  maker          users           @relation("maker", fields: [maker_id], references: [id])
  taker          users           @relation("taker", fields: [taker_id], references: [id])
  messages       p2p_messages[]
  disputes       p2p_disputes[]

  @@index([maker_id])
  @@index([taker_id])
  @@index([status])
}

model p2p_messages {
  id         String   @id @default(uuid())
  order_id   String
  sender_id  String
  message    String
  attachments Json?
  created_at DateTime @default(now())

  order      p2p_orders @relation(fields: [order_id], references: [id])
  sender     users      @relation(fields: [sender_id], references: [id])

  @@index([order_id])
}

model p2p_disputes {
  id                 String           @id @default(uuid())
  order_id           String
  raised_by_user_id  String
  reason             String?
  description        String?
  status             P2PDisputeStatus @default(OPEN)
  resolved_by_admin_id String?
  resolution_note    String?
  resolved_at        DateTime?
  attachments        Json?
  created_at         DateTime         @default(now())
  updated_at         DateTime         @updatedAt

  order              p2p_orders       @relation(fields: [order_id], references: [id])
  raised_by          users            @relation(fields: [raised_by_user_id], references: [id])

  @@index([order_id])
  @@index([status])
}

model p2p_ratings {
  id           String   @id @default(uuid())
  order_id     String
  from_user_id String
  to_user_id   String
  stars        Int
  comment      String?
  created_at   DateTime @default(now())

  order        p2p_orders @relation(fields: [order_id], references: [id])
  from_user    users      @relation("from_user", fields: [from_user_id], references: [id])
  to_user      users      @relation("to_user", fields: [to_user_id], references: [id])

  @@index([to_user_id])
}
```

## Appendix B) API হ্যান্ডলার কাঠামো (ফাইলম্যাপ)
- `app/api/p2p/offers/route.ts` – GET, POST
- `app/api/p2p/offers/[id]/route.ts` – PATCH
- `app/api/p2p/offers/[id]/pause/route.ts` – POST
- `app/api/p2p/offers/[id]/resume/route.ts` – POST
- `app/api/p2p/payment-methods/route.ts` – GET, POST
- `app/api/p2p/payment-methods/[id]/route.ts` – PATCH, DELETE
- `app/api/p2p/orders/route.ts` – GET (list), POST (create)
- `app/api/p2p/orders/[id]/route.ts` – GET (detail)
- `app/api/p2p/orders/[id]/mark-paid/route.ts` – POST
- `app/api/p2p/orders/[id]/release/route.ts` – POST
- `app/api/p2p/orders/[id]/cancel/route.ts` – POST
- `app/api/p2p/orders/[id]/messages/route.ts` – GET, POST
- `app/api/p2p/orders/[id]/dispute/route.ts` – POST
- Admin: `app/api/admin/p2p/disputes/route.ts`, `app/api/admin/p2p/disputes/[id]/resolve/route.ts`

## Appendix C) ন্যূনতম Happy-Path টেস্ট কেস
1) Seller অফার (SELL USDT) পোস্ট করে → Buyer লিস্ট থেকে অর্ডার ওপেন
2) এসক্রো হোল্ড হয় → Buyer mark-paid → Seller release → Buyer ব্যালেন্স ক্রেডিট
3) ফি ledger পোস্ট হয় → Order RELEASED → উভয় পক্ষ rating দিতে পারে

## বাস্তবায়নের প্রস্তাবিত ক্রম (Sprint-wise)
- Sprint 1: Schema + Migrations + Seed + Payment Methods CRUD
- Sprint 2: Offers API + UI (create/list/pause)
- Sprint 3: Orders lifecycle (create/hold/paid/release/cancel) + Chat (polling)
- Sprint 4: Disputes + Admin resolve + Fees/Reports
- Sprint 5: E2E tests + Polish (2FA, limits, KYC gating)

