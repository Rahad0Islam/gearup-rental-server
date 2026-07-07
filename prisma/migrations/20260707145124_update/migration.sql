/*
  Warnings:

  - A unique constraint covering the columns `[checkOutSessionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payments_checkOutSessionId_key" ON "payments"("checkOutSessionId");
