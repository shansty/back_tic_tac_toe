/*
  Warnings:

  - You are about to drop the column `game_user_acceptor_id` on the `game_fights` table. All the data in the column will be lost.
  - You are about to drop the column `game_user_initiator_id` on the `game_fights` table. All the data in the column will be lost.
  - Added the required column `user_acceptor_id` to the `game_fights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_initiator_id` to the `game_fights` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "game_fights" DROP CONSTRAINT "game_fights_game_user_acceptor_id_fkey";

-- DropForeignKey
ALTER TABLE "game_fights" DROP CONSTRAINT "game_fights_game_user_initiator_id_fkey";

-- AlterTable
ALTER TABLE "game_fights" DROP COLUMN "game_user_acceptor_id",
DROP COLUMN "game_user_initiator_id",
ADD COLUMN     "user_acceptor_id" INTEGER NOT NULL,
ADD COLUMN     "user_initiator_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "game_fights" ADD CONSTRAINT "game_fights_user_initiator_id_fkey" FOREIGN KEY ("user_initiator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_fights" ADD CONSTRAINT "game_fights_user_acceptor_id_fkey" FOREIGN KEY ("user_acceptor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
