-- DropForeignKey
ALTER TABLE "game_users" DROP CONSTRAINT "game_users_game_id_fkey";

-- AlterTable
ALTER TABLE "game_users" ALTER COLUMN "game_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "game_users" ADD CONSTRAINT "game_users_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
