-- CreateTable
CREATE TABLE "crypto_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "display_name" TEXT,
    "contract" TEXT,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "min_deposit" DECIMAL NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "deposit_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "crypto_asset_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "derivation_path" TEXT,
    "memo_tag" TEXT,
    "amount_expected" DECIMAL,
    "fiat_locked_usd" DECIMAL,
    "rate_source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tx_hash" TEXT,
    "detected_amount" DECIMAL,
    "confirmations" INTEGER DEFAULT 0,
    "min_confirmations" INTEGER NOT NULL DEFAULT 1,
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "deposit_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deposit_sessions_crypto_asset_id_fkey" FOREIGN KEY ("crypto_asset_id") REFERENCES "crypto_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_ledger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "meta" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "asset_symbol" TEXT NOT NULL,
    "crypto_asset_id" TEXT,
    "fiat_currency" TEXT NOT NULL,
    "price_type" TEXT NOT NULL,
    "fixed_price" DECIMAL,
    "margin_percent" DECIMAL,
    "min_amount_asset" DECIMAL NOT NULL,
    "max_amount_asset" DECIMAL NOT NULL,
    "min_limit_fiat" DECIMAL NOT NULL,
    "max_limit_fiat" DECIMAL NOT NULL,
    "terms" TEXT,
    "auto_reply" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "total_trades" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" INTEGER NOT NULL DEFAULT 100,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "p2p_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_payment_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "details" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_offer_payment_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offer_id" TEXT NOT NULL,
    "payment_method_id" TEXT NOT NULL,
    CONSTRAINT "p2p_offer_payment_methods_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "p2p_offers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_offer_payment_methods_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "user_payment_methods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_orders" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "p2p_orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "p2p_offers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_orders_maker_id_fkey" FOREIGN KEY ("maker_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_orders_taker_id_fkey" FOREIGN KEY ("taker_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "p2p_messages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "p2p_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "raised_by_user_id" TEXT NOT NULL,
    "reason" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolved_by_admin_id" TEXT,
    "resolution_note" TEXT,
    "resolved_at" DATETIME,
    "attachments" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "p2p_disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "p2p_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_disputes_raised_by_user_id_fkey" FOREIGN KEY ("raised_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "p2p_ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "p2p_ratings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "p2p_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_ratings_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "p2p_ratings_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "crypto_assets_is_active_idx" ON "crypto_assets"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_assets_symbol_network_key" ON "crypto_assets"("symbol", "network");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_sessions_tx_hash_key" ON "deposit_sessions"("tx_hash");

-- CreateIndex
CREATE INDEX "deposit_sessions_user_id_idx" ON "deposit_sessions"("user_id");

-- CreateIndex
CREATE INDEX "deposit_sessions_status_idx" ON "deposit_sessions"("status");

-- CreateIndex
CREATE INDEX "deposit_sessions_expires_at_idx" ON "deposit_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "deposit_sessions_crypto_asset_id_idx" ON "deposit_sessions"("crypto_asset_id");

-- CreateIndex
CREATE INDEX "wallet_ledger_user_id_idx" ON "wallet_ledger"("user_id");

-- CreateIndex
CREATE INDEX "wallet_ledger_type_idx" ON "wallet_ledger"("type");

-- CreateIndex
CREATE INDEX "p2p_offers_user_id_idx" ON "p2p_offers"("user_id");

-- CreateIndex
CREATE INDEX "p2p_offers_status_idx" ON "p2p_offers"("status");

-- CreateIndex
CREATE INDEX "p2p_offers_asset_symbol_fiat_currency_side_idx" ON "p2p_offers"("asset_symbol", "fiat_currency", "side");

-- CreateIndex
CREATE INDEX "user_payment_methods_user_id_idx" ON "user_payment_methods"("user_id");

-- CreateIndex
CREATE INDEX "user_payment_methods_type_idx" ON "user_payment_methods"("type");

-- CreateIndex
CREATE UNIQUE INDEX "p2p_offer_payment_methods_offer_id_payment_method_id_key" ON "p2p_offer_payment_methods"("offer_id", "payment_method_id");

-- CreateIndex
CREATE INDEX "p2p_orders_maker_id_idx" ON "p2p_orders"("maker_id");

-- CreateIndex
CREATE INDEX "p2p_orders_taker_id_idx" ON "p2p_orders"("taker_id");

-- CreateIndex
CREATE INDEX "p2p_orders_status_idx" ON "p2p_orders"("status");

-- CreateIndex
CREATE INDEX "p2p_messages_order_id_idx" ON "p2p_messages"("order_id");

-- CreateIndex
CREATE INDEX "p2p_disputes_order_id_idx" ON "p2p_disputes"("order_id");

-- CreateIndex
CREATE INDEX "p2p_disputes_status_idx" ON "p2p_disputes"("status");

-- CreateIndex
CREATE INDEX "p2p_ratings_to_user_id_idx" ON "p2p_ratings"("to_user_id");

-- CreateIndex
CREATE INDEX "trades_user_id_result_idx" ON "trades"("user_id", "result");

-- CreateIndex
CREATE INDEX "trades_user_id_status_idx" ON "trades"("user_id", "status");

-- CreateIndex
CREATE INDEX "trades_user_id_open_time_idx" ON "trades"("user_id", "open_time");
