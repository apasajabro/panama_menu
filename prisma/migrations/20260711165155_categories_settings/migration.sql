-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" VARCHAR(30) NOT NULL DEFAULT 'main',
    "orders_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_sort_order_idx" ON "categories"("is_active", "sort_order");

-- Preserve existing menu category values before enforcing the foreign key.
INSERT INTO "categories" ("id", "name", "slug", "sort_order", "updated_at") VALUES
    (gen_random_uuid(), 'Makanan', 'main', 1, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Snack', 'snack', 2, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Minuman', 'drink', 3, CURRENT_TIMESTAMP);

INSERT INTO "site_settings" ("id", "orders_enabled", "updated_at")
VALUES ('main', true, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
