/*
  Warnings:

  - You are about to drop the column `o` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player_o_id` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player_x_id` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `message_histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER_X', 'PLAYER_O');

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_player_o_id_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_player_x_id_fkey";

-- DropForeignKey
ALTER TABLE "message_histories" DROP CONSTRAINT "message_histories_game_id_fkey";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "o",
DROP COLUMN "player_o_id",
DROP COLUMN "player_x_id",
DROP COLUMN "x";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "message_histories";

-- DropEnum
DROP TYPE "Sender";

-- CreateTable
CREATE TABLE "game_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "game_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_moves" (
    "id" SERIAL NOT NULL,
    "game_user_id" INTEGER NOT NULL,
    "move_index" INTEGER NOT NULL,
    "game_id" TEXT NOT NULL,

    CONSTRAINT "game_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_messages" (
    "id" SERIAL NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "game_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_users_user_id_game_id_key" ON "game_users"("user_id", "game_id");

-- AddForeignKey
ALTER TABLE "game_users" ADD CONSTRAINT "game_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_users" ADD CONSTRAINT "game_users_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_user_id_fkey" FOREIGN KEY ("game_user_id") REFERENCES "game_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_messages" ADD CONSTRAINT "game_messages_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_messages" ADD CONSTRAINT "game_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
