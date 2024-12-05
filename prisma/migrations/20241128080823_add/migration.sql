/*
  Warnings:

  - A unique constraint covering the columns `[user_id,game_id]` on the table `game_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "game_users_user_id_game_id_key" ON "game_users"("user_id", "game_id");
