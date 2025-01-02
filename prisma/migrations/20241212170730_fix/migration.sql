/*
  Warnings:

  - You are about to alter the column `expiry_date` on the `users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "expiry_date" SET DATA TYPE INTEGER;
