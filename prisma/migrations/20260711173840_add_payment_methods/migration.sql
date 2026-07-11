-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "instruction" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "qr_image" TEXT,
    "accounts" JSONB,
    "note" VARCHAR(500),
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_is_active_sort_order_idx" ON "payment_methods"("is_active", "sort_order");
