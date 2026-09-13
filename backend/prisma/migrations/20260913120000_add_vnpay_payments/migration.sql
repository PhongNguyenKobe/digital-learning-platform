CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'VNPAY',
  "txnRef" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "vnpTransactionNo" TEXT,
  "bankCode" TEXT,
  "responseCode" TEXT,
  "paidAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "rawResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_txnRef_key" ON "payments"("txnRef");
CREATE UNIQUE INDEX "payments_vnpTransactionNo_key" ON "payments"("vnpTransactionNo");
CREATE INDEX "payments_userId_status_createdAt_idx" ON "payments"("userId", "status", "createdAt");
CREATE INDEX "payments_status_expiresAt_idx" ON "payments"("status", "expiresAt");
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
