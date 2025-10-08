-- CreateTable
CREATE TABLE "currency_pairs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "display" TEXT,
    "provider" TEXT,
    "provider_symbol" TEXT,
    "price_decimals" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "payout" INTEGER,
    "latest_price" DECIMAL,
    "last_updated" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "forex_candles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "open" DECIMAL NOT NULL,
    "high" DECIMAL NOT NULL,
    "low" DECIMAL NOT NULL,
    "close" DECIMAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "date_of_birth" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "balance" DECIMAL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "amount" DECIMAL,
    "method" TEXT,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "amount" DECIMAL,
    "method" TEXT,
    "account_info" JSONB,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "symbol" TEXT,
    "amount" DECIMAL,
    "direction" TEXT,
    "open_time" DATETIME,
    "close_time" DATETIME,
    "result" TEXT,
    CONSTRAINT "trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "amount" DECIMAL,
    "rank" INTEGER,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "prize_pool" DECIMAL,
    "entry_fee" DECIMAL,
    "participants" INTEGER,
    "duration" TEXT,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "sender" TEXT,
    "message" TEXT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "notifications" BOOLEAN DEFAULT false,
    "private" BOOLEAN DEFAULT false,
    CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "currency_pairs_symbol_key" ON "currency_pairs"("symbol");

-- CreateIndex
CREATE INDEX "currency_pairs_status_idx" ON "currency_pairs"("status");

-- CreateIndex
CREATE INDEX "currency_pairs_isDeleted_idx" ON "currency_pairs"("isDeleted");

-- CreateIndex
CREATE INDEX "currency_pairs_symbol_idx" ON "currency_pairs"("symbol");

-- CreateIndex
CREATE INDEX "forex_candles_symbol_interval_time_idx" ON "forex_candles"("symbol", "interval", "time");

-- CreateIndex
CREATE UNIQUE INDEX "forex_candles_symbol_interval_time_key" ON "forex_candles"("symbol", "interval", "time");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "deposits_user_id_idx" ON "deposits"("user_id");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "trades_user_id_idx" ON "trades"("user_id");

-- CreateIndex
CREATE INDEX "leaderboard_user_id_idx" ON "leaderboard"("user_id");

-- CreateIndex
CREATE INDEX "support_messages_user_id_idx" ON "support_messages"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages"("user_id");

-- CreateIndex
CREATE INDEX "settings_user_id_idx" ON "settings"("user_id");
