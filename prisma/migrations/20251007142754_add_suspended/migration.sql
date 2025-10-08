-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "demo_balance" DECIMAL DEFAULT 10000
);
INSERT INTO "new_users" ("address", "avatar_url", "balance", "city", "country", "created_at", "date_of_birth", "demo_balance", "email", "first_name", "id", "is_admin", "is_verified", "last_name", "name", "password_hash", "phone", "postal_code", "updated_at") SELECT "address", "avatar_url", "balance", "city", "country", "created_at", "date_of_birth", "demo_balance", "email", "first_name", "id", "is_admin", "is_verified", "last_name", "name", "password_hash", "phone", "postal_code", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
