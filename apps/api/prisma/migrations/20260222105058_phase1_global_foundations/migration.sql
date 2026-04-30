/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderOrigin" AS ENUM ('WAITER', 'GUEST_QR', 'DELIVERY', 'KIOSK');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "origin" "OrderOrigin" NOT NULL DEFAULT 'WAITER';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "defaultCurrency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "planType" TEXT NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'TR',
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "taxStrategyId" TEXT NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "providerRef" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_idempotencyKey_key" ON "payment_attempts"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_attempts_tenantId_orderId_idx" ON "payment_attempts"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "payment_attempts_idempotencyKey_idx" ON "payment_attempts"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON "orders"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
