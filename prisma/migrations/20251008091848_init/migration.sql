-- CreateTable
CREATE TABLE "payment_method_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "currency" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "payment_method_templates_type_idx" ON "payment_method_templates"("type");

-- CreateIndex
CREATE INDEX "payment_method_templates_country_idx" ON "payment_method_templates"("country");

-- CreateIndex
CREATE INDEX "payment_method_templates_currency_idx" ON "payment_method_templates"("currency");
