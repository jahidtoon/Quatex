/*
  Warnings:

  - You are about to drop the column `duration` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `participants` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `prize_pool` on the `tournaments` table. All the data in the column will be lost.
  - Added the required column `end_date` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `tournaments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "preferred_currency" TEXT DEFAULT 'USD';
ALTER TABLE "users" ADD COLUMN "tournament_balance" DECIMAL DEFAULT 0;

-- CreateTable
CREATE TABLE "currency_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" DECIMAL NOT NULL,
    "min_amount" DECIMAL NOT NULL DEFAULT 1,
    "max_amount" DECIMAL NOT NULL DEFAULT 1000000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tournament_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournament_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entry_paid" DECIMAL NOT NULL DEFAULT 0,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starting_balance" DECIMAL NOT NULL DEFAULT 0,
    "current_balance" DECIMAL NOT NULL DEFAULT 0,
    "total_trades" INTEGER NOT NULL DEFAULT 0,
    "winning_trades" INTEGER NOT NULL DEFAULT 0,
    "total_profit" DECIMAL NOT NULL DEFAULT 0,
    "total_volume" DECIMAL NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "prize_won" DECIMAL DEFAULT 0,
    "is_disqualified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "tournament_participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tournament_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tournament_prizes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournament_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "prize_amount" DECIMAL NOT NULL,
    "prize_type" TEXT NOT NULL DEFAULT 'CASH',
    "description" TEXT,
    CONSTRAINT "tournament_prizes_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tournament_leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournament_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "total_profit" DECIMAL NOT NULL DEFAULT 0,
    "total_trades" INTEGER NOT NULL DEFAULT 0,
    "win_rate" DECIMAL NOT NULL DEFAULT 0,
    "total_volume" DECIMAL NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tournament_leaderboard_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_p2p_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offer_id" TEXT NOT NULL,
    "maker_id" TEXT NOT NULL,
    "taker_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "asset_symbol" TEXT NOT NULL,
    "fiat_currency" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "amount_asset" DECIMAL NOT NULL,
    "amount_fiat" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "escrow_held" BOOLEAN NOT NULL DEFAULT false,
    "escrow_ledger_id" TEXT,
    "reference_code" TEXT,
    "meta" JSONB,
    "expires_at" DATETIME,
    "paid_at" DATETIME,
    "released_at" DATETIME,
    "canceled_at" DATETIME,
    "maker_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "taker_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "p2p_orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "p2p_offers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_orders_maker_id_fkey" FOREIGN KEY ("maker_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_orders_taker_id_fkey" FOREIGN KEY ("taker_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_p2p_orders" ("amount_asset", "amount_fiat", "asset_symbol", "canceled_at", "created_at", "escrow_held", "escrow_ledger_id", "expires_at", "fiat_currency", "id", "maker_id", "meta", "offer_id", "paid_at", "price", "reference_code", "released_at", "side", "status", "taker_id", "updated_at") SELECT "amount_asset", "amount_fiat", "asset_symbol", "canceled_at", "created_at", "escrow_held", "escrow_ledger_id", "expires_at", "fiat_currency", "id", "maker_id", "meta", "offer_id", "paid_at", "price", "reference_code", "released_at", "side", "status", "taker_id", "updated_at" FROM "p2p_orders";
DROP TABLE "p2p_orders";
ALTER TABLE "new_p2p_orders" RENAME TO "p2p_orders";
CREATE INDEX "p2p_orders_maker_id_idx" ON "p2p_orders"("maker_id");
CREATE INDEX "p2p_orders_taker_id_idx" ON "p2p_orders"("taker_id");
CREATE INDEX "p2p_orders_status_idx" ON "p2p_orders"("status");
CREATE TABLE "new_tournaments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PROFIT_BASED',
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "entry_fee" DECIMAL NOT NULL DEFAULT 0,
    "max_participants" INTEGER,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "total_prize_pool" DECIMAL NOT NULL DEFAULT 0,
    "current_participants" INTEGER NOT NULL DEFAULT 0,
    "rules" TEXT,
    "banner_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_tournaments" ("created_at", "entry_fee", "id", "status", "title") SELECT "created_at", coalesce("entry_fee", 0) AS "entry_fee", "id", coalesce("status", 'UPCOMING') AS "status", "title" FROM "tournaments";
DROP TABLE "tournaments";
ALTER TABLE "new_tournaments" RENAME TO "tournaments";
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");
CREATE INDEX "tournaments_start_date_idx" ON "tournaments"("start_date");
CREATE INDEX "tournaments_end_date_idx" ON "tournaments"("end_date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "currency_rates_from_currency_idx" ON "currency_rates"("from_currency");

-- CreateIndex
CREATE INDEX "currency_rates_to_currency_idx" ON "currency_rates"("to_currency");

-- CreateIndex
CREATE INDEX "currency_rates_is_active_idx" ON "currency_rates"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "currency_rates_from_currency_to_currency_key" ON "currency_rates"("from_currency", "to_currency");

-- CreateIndex
CREATE INDEX "tournament_participants_tournament_id_idx" ON "tournament_participants"("tournament_id");

-- CreateIndex
CREATE INDEX "tournament_participants_user_id_idx" ON "tournament_participants"("user_id");

-- CreateIndex
CREATE INDEX "tournament_participants_rank_idx" ON "tournament_participants"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_tournament_id_user_id_key" ON "tournament_participants"("tournament_id", "user_id");

-- CreateIndex
CREATE INDEX "tournament_prizes_tournament_id_idx" ON "tournament_prizes"("tournament_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_prizes_tournament_id_rank_key" ON "tournament_prizes"("tournament_id", "rank");

-- CreateIndex
CREATE INDEX "tournament_leaderboard_tournament_id_rank_idx" ON "tournament_leaderboard"("tournament_id", "rank");

-- CreateIndex
CREATE INDEX "tournament_leaderboard_user_id_idx" ON "tournament_leaderboard"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_leaderboard_tournament_id_user_id_key" ON "tournament_leaderboard"("tournament_id", "user_id");
