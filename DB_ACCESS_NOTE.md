# ডাটাবেস Access নোট (Self-hosted PostgreSQL + Prisma)

এই প্রজেক্ট এখন self-hosted PostgreSQL ব্যবহার করে (VPS এ)। নিচে দ্রুত রেফারেন্স:

## 1. Environment Variable
`.env.local` অথবা `.env` এ একটি লাইন রাখুন:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
```
উদাহরণ (লোকাল):
```
DATABASE_URL=postgresql://appuser:secret@localhost:5432/quatex
```

## 2. PostgreSQL ইন্সটল (Ubuntu VPS)
```
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE ROLE appuser WITH LOGIN PASSWORD 'secret';"
sudo -u postgres psql -c "CREATE DATABASE quatex OWNER appuser;"
sudo -u postgres psql -d quatex -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

## 3. Remote Access (প্রয়োজনে)
ফাইল সম্পাদনা:
- `/etc/postgresql/14/main/postgresql.conf` এ `listen_addresses = '*'`
- `/etc/postgresql/14/main/pg_hba.conf` এ লাইন যোগ:
```
host    quatex   appuser   0.0.0.0/0    scram-sha-256
```
তারপর:
```
sudo systemctl restart postgresql
```
সিকিউরিটির জন্য নির্দিষ্ট IP ব্যবহার করা উত্তম।

## 4. Prisma Migration
```
npm run prisma:generate
npm run prisma:migrate
```

## 5. Prisma Studio (ডাটাবেস ব্রাউজ)
```
npm run prisma:studio
```
ব্রাউজার: http://localhost:5555

## 6. API Test (Users)
সার্ভার চলছে এমন অবস্থায়:
```
curl http://localhost:3000/api/users
```

## 7. ব্যাকআপ (দ্রুত কমান্ড)
```
pg_dump -Fc -d quatex -h HOST -U appuser > backup_quatex_$(date +%F).dump
```
রিস্টোর:
```
pg_restore -d quatex -h HOST -U appuser backup_quatex_YYYY-MM-DD.dump
```

## 8. Production Hardening Quick Checklist
- শক্তিশালী পাসওয়ার্ড
- ফায়ারওয়াল (ufw allow 5432/tcp (শুধু বিশ্বস্ত IP))
- স্বয়ংক্রিয় ব্যাকআপ স্ক্রিপ্ট (cron)
- মনিটরিং: `pg_stat_statements`, `prometheus exporter`

## 9. সাধারণ সমস্যা
| সমস্যা | সমাধান |
|-------|--------|
| ECONNREFUSED | হোস্ট/পোর্ট ভুল বা Postgres চলছে না |
| password authentication failed | ইউজার/পাস ঠিক নয়, `psql` দিয়ে যাচাই করুন |
| relation does not exist | মাইগ্রেশন চালান: `npm run prisma:migrate` |
| uuid_generate_v4() missing | `CREATE EXTENSION "uuid-ossp";` চালান |

## 10. ভবিষ্যৎ এক্সটেনশন আইডিয়া
- Redis cache (সেশন / লিডারবোর্ড ফাস্ট)
- Hasura / Directus যুক্ত করে অটো API
- Keycloak / Auth.js দিয়ে Auth যোগ

এই নোট আপডেট রাখতে ভুলবেন না। প্রয়োজনে আরো নির্দেশনা চাইলে জানাবেন।
