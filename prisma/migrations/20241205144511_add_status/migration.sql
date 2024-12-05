/*
  Warnings:

  - A unique constraint covering the columns `[user_initiator_id,user_acceptor_id,status]` on the table `game_fights` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "game_fights_user_initiator_id_user_acceptor_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "game_fights_user_initiator_id_user_acceptor_id_status_key" ON "game_fights"("user_initiator_id", "user_acceptor_id", "status");
