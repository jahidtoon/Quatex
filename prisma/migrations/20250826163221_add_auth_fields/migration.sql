/*
  Warnings:

  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "country" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."forex_candles" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL,
    "open" DECIMAL NOT NULL,
    "high" DECIMAL NOT NULL,
    "low" DECIMAL NOT NULL,
    "close" DECIMAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "forex_candles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forex_candles_symbol_interval_time_idx" ON "public"."forex_candles"("symbol", "interval", "time");

-- CreateIndex
CREATE UNIQUE INDEX "forex_candles_symbol_interval_time_key" ON "public"."forex_candles"("symbol", "interval", "time");
