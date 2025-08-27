-- CreateEnum
CREATE TYPE "public"."PairStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateTable
CREATE TABLE "public"."currency_pairs" (
    "id" UUID NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "display" TEXT,
    "provider" TEXT,
    "provider_symbol" TEXT,
    "price_decimals" INTEGER,
    "status" "public"."PairStatus" NOT NULL DEFAULT 'ACTIVE',
    "payout" INTEGER,
    "latest_price" DECIMAL,
    "last_updated" TIMESTAMPTZ(6),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "currency_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deposits" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "amount" DECIMAL,
    "method" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."withdrawals" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "amount" DECIMAL,
    "method" TEXT,
    "account_info" JSONB,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trades" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "symbol" TEXT,
    "amount" DECIMAL,
    "direction" TEXT,
    "open_time" TIMESTAMPTZ(6),
    "close_time" TIMESTAMPTZ(6),
    "result" TEXT,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leaderboard" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "amount" DECIMAL,
    "rank" INTEGER,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tournaments" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "prize_pool" DECIMAL,
    "entry_fee" DECIMAL,
    "participants" INTEGER,
    "duration" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_messages" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "sender" TEXT,
    "message" TEXT,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "notifications" BOOLEAN DEFAULT false,
    "private" BOOLEAN DEFAULT false,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currency_pairs_symbol_key" ON "public"."currency_pairs"("symbol");

-- CreateIndex
CREATE INDEX "currency_pairs_status_idx" ON "public"."currency_pairs"("status");

-- CreateIndex
CREATE INDEX "currency_pairs_isDeleted_idx" ON "public"."currency_pairs"("isDeleted");

-- CreateIndex
CREATE INDEX "currency_pairs_symbol_idx" ON "public"."currency_pairs"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "deposits_user_id_idx" ON "public"."deposits"("user_id");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "public"."withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "trades_user_id_idx" ON "public"."trades"("user_id");

-- CreateIndex
CREATE INDEX "leaderboard_user_id_idx" ON "public"."leaderboard"("user_id");

-- CreateIndex
CREATE INDEX "support_messages_user_id_idx" ON "public"."support_messages"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_idx" ON "public"."chat_messages"("user_id");

-- CreateIndex
CREATE INDEX "settings_user_id_idx" ON "public"."settings"("user_id");

-- AddForeignKey
ALTER TABLE "public"."deposits" ADD CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_messages" ADD CONSTRAINT "support_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
