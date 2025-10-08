-- AlterTable
ALTER TABLE "trades" ADD COLUMN "status" TEXT DEFAULT 'open';
ALTER TABLE "trades" ADD COLUMN "entry_price" DECIMAL;
ALTER TABLE "trades" ADD COLUMN "payout" DECIMAL;
ALTER TABLE "trades" ADD COLUMN "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "trades" ADD COLUMN "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "trades" ADD COLUMN "account_type" TEXT DEFAULT 'live';

ALTER TABLE "users" ADD COLUMN "demo_balance" DECIMAL DEFAULT 10000;

UPDATE "trades" SET "status" = 'open' WHERE "status" IS NULL;
UPDATE "trades" SET "account_type" = 'live' WHERE "account_type" IS NULL;
UPDATE "users" SET "demo_balance" = 10000 WHERE "demo_balance" IS NULL;
