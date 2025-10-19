-- AlterTable
ALTER TABLE "users" ADD COLUMN "referred_by_affiliate_id" TEXT;

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "tier" TEXT NOT NULL DEFAULT 'Bronze',
    "commission_rate" INTEGER NOT NULL DEFAULT 30,
    "referral_code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "affiliate_referrals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "total_deposit" DECIMAL NOT NULL DEFAULT 0,
    "total_trades" INTEGER NOT NULL DEFAULT 0,
    "earnings" DECIMAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "affiliate_referrals_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "affiliate_referrals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "referral_user_id" TEXT,
    "type" TEXT NOT NULL,
    "rate" INTEGER NOT NULL DEFAULT 30,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "transaction_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliate_commissions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "affiliate_commissions_referral_user_id_fkey" FOREIGN KEY ("referral_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliate_payouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "note" TEXT,
    CONSTRAINT "affiliate_payouts_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_email_key" ON "affiliates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_referral_code_key" ON "affiliates"("referral_code");

-- CreateIndex
CREATE INDEX "affiliate_referrals_affiliate_id_idx" ON "affiliate_referrals"("affiliate_id");

-- CreateIndex
CREATE INDEX "affiliate_referrals_user_id_idx" ON "affiliate_referrals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_referrals_affiliate_id_user_id_key" ON "affiliate_referrals"("affiliate_id", "user_id");

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliate_id_idx" ON "affiliate_commissions"("affiliate_id");

-- CreateIndex
CREATE INDEX "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

-- CreateIndex
CREATE INDEX "affiliate_payouts_affiliate_id_idx" ON "affiliate_payouts"("affiliate_id");

-- CreateIndex
CREATE INDEX "affiliate_payouts_status_idx" ON "affiliate_payouts"("status");
