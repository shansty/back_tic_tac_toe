-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'REJECTED', 'IN_PROCESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "game_fights" (
    "id" SERIAL NOT NULL,
    "game_user_initiator_id" INTEGER NOT NULL,
    "game_user_acceptor_id" INTEGER NOT NULL,
    "game_id" TEXT,
    "status" "Status" NOT NULL,

    CONSTRAINT "game_fights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_fights" ADD CONSTRAINT "game_fights_game_user_initiator_id_fkey" FOREIGN KEY ("game_user_initiator_id") REFERENCES "game_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_fights" ADD CONSTRAINT "game_fights_game_user_acceptor_id_fkey" FOREIGN KEY ("game_user_acceptor_id") REFERENCES "game_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_fights" ADD CONSTRAINT "game_fights_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
