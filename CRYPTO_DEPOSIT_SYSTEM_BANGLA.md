# Quatex ক্রিপ্টো ডিপোজিট সিস্টেম (বাংলা ডকুমেন্টেশন)

## ফিচার সারাংশ
- Admin full wallet overview
- User per-deposit unique address
- ৩০ মিনিটের countdown
- Late payment detection
- HD wallet ভিত্তিক address derivation (placeholder)
- Deposit session status: PENDING, DETECTED, CONFIRMED, LATE_CONFIRMED, EXPIRED
- Ledger entry + balance credit

## Database Model
- `crypto_assets`: কয়েন/নেটওয়ার্ক
- `deposit_sessions`: প্রতিটি ডিপোজিট রিকোয়েস্ট
- `wallet_ledger`: ব্যালেন্স ট্র্যাকিং

## API Routes
- POST `/api/deposits/session` — নতুন ডিপোজিট সেশন তৈরি
- GET `/api/deposits/session/[id]` — সেশন স্ট্যাটাস
- (Admin) `/app/admin/wallet.jsx` — ওয়ালেট ও ডিপোজিট সেশন তালিকা
 - GET `/api/crypto-assets` — সক্রিয় অ্যাসেট লিস্ট
 - GET `/api/deposits/history?limit=15` — ইউজারের সাম্প্রতিক ডিপোজিট সেশন
 - GET `/api/admin/deposit-sessions` — অ্যাডমিন সব সেশন দেখতে (auth + admin)
 - GET `/api/admin/wallet/addresses` — অ্যাডমিন ডেরাইভড অ্যাড্রেস/ব্যালেন্স লিস্ট (auth + admin)
 - POST `/api/admin/wallet/transfer` — নেটিভ কয়েন ট্রান্সফার (ETH/BNB/TRX), env guard সহ (auth + admin)

## Deposit Flow
1. ইউজার কয়েন/নেটওয়ার্ক নির্বাচন করে
2. Backend address derive করে session তৈরি করে (৩০ মিনিট expiry)
3. UI তে QR code, address, countdown দেখায়
4. ইউজার পেমেন্ট পাঠায়
5. Watcher script blockchain থেকে detect করে
   - ৩০ মিনিটের মধ্যে: CONFIRMED
   - ৩০ মিনিট পরে: LATE_CONFIRMED
6. ব্যালেন্স credit + ledger entry

## Late Payment Handling
- expires_at পেরিয়ে payment এলে session.status = LATE_CONFIRMED, is_late = true
- Admin panel-এ late flag দেখায়

## Admin Panel
- কয়েন তালিকা, active/inactive
- Recent deposit sessions: user, asset, address, status, amount, expiry, late flag
- Manual transfer skeleton (পরবর্তী ফেজে)

## Watcher Script
- `scripts/watchDeposits.js`
- প্রতিটি active session poll করে
- Simulated detection/confirmation (production-এ blockchain API integration লাগবে)
- Late payment logic

## Frontend
- `/app/deposit/crypto.jsx` — ইউজার কয়েন নির্বাচন, QR, countdown, session status
- `/app/admin/wallet.jsx` — Admin overview

## Security
- Address per deposit, no reuse
- HD derivation placeholder (production-এ xpub/xprv integration)
- No private key server-side
 - বাস্তব অ্যাড্রেসের জন্য `.env` এ `HD_MNEMONIC` ব্যবহার করুন (১২/২৪ শব্দ)। কখনো গিটে কমিট করবেন না।
 - এই প্রজেক্ট এখন receive + admin hot wallet send (native) সাপোর্ট করে। প্রোডাকশনে withdrawal সাইনিং আলাদা নিরাপদ সার্ভিস/কী-ম্যানেজমেন্টে রাখা উত্তম।

### Hot Wallet Env Setup
- HD_MNEMONIC="word1 word2 ... word12"
- HOT_WALLET_ENABLED=1
- RPC_ETH=https://... (Ethereum mainnet RPC)
- RPC_BSC=https://... (BSC mainnet RPC)
- RPC_TRON=https://api.trongrid.io (বা আপনার Tron নোড)

নিরাপত্তা: এই ভ্যারিয়েবলগুলো কখনো গিটে কমিট করবেন না। `.env.local` ব্যবহার করুন এবং সার্ভার রিস্টার্ট প্রয়োজন।

## Future Enhancements
- Real blockchain address derivation
- Webhook-based detection
- Withdrawal automation
- Multi-network support

---

## টেস্ট ও ডেভেলপমেন্ট
- Seed script: `scripts/seedCryptoAssets.js`
- Watcher: `scripts/watchDeposits.js`
- Manual test: API route POST/GET
 - Real addresses: `.env` এ `HD_MNEMONIC="word1 word2 ... word12"` যোগ করে সার্ভার রিস্টার্ট করুন। তারপর `/deposit` থেকে সেশন তৈরি করলে নেটওয়ার্কভেদে রিয়েল অ্যাড্রেস পাবেন (BTC/ETH/BSC/TRON)।
 - Admin Wallet Addresses: `/api/admin/wallet/addresses?networks=eth,bsc,tron&count=5` (Authorization Bearer আবশ্যক)
 - Admin Transfer: `POST /api/admin/wallet/transfer` বডি `{ network, to, amount, assetSymbol?, fromIndex? }` (HOT_WALLET_ENABLED=1 দরকার)

### নোট: অথ টোকেন
ফ্রন্টএন্ড localStorage key: `auth_token` (লগইনের পর সেট হতে হবে)।
API হিট করার সময় Authorization: `Bearer <token>` হেডার পাঠানো বাধ্যতামূলক (deposit session তৈরি / history / admin endpoints)।

## প্রশ্ন থাকলে: এই ফাইল বা `/app/admin/wallet.jsx` দেখে শুরু করতে পারো।
