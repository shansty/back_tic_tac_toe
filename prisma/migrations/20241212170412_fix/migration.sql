/*
  Warnings:

  - You are about to drop the column `accessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "accessToken",
DROP COLUMN "expiryDate",
DROP COLUMN "refreshToken",
ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "expiry_date" BIGINT,
ADD COLUMN     "id_token" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "token_type" TEXT;
