-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "expiryDate" BIGINT,
ADD COLUMN     "refreshToken" TEXT;
