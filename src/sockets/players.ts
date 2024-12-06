import io from '../my_socket_io_server';
import prisma from '../prisma-client';

export const playersSocket = io.of("/players");

playersSocket.on("connection", socket => {

    socket.on('players_start', async (msg: string) => {
        console.log(msg)
        const players = await prisma.user.findMany({
            orderBy: { winner_games: 'desc' },
            select: {
                user_name: true,
                winner_games: true, 
            },
        });
        
        console.dir({ players })

        playersSocket.emit("get_all_players", players)
    });

    socket.on("throw_down_a_challenge", async (userId: number, rival_username: string) => {
        const acceptor = await prisma.user.findFirst({
            where: {
                user_name: rival_username
            }
        })
        if (!acceptor) {
            return;
        }
        if(userId === acceptor.id) {
            return;
        }
        const check_if_challenge_exist = await prisma.gameFight.findFirst({
            where: {
                user_acceptor_id: acceptor.id,
                user_initiator_id: userId,
                status: "PENDING"
            }
        })
        console.dir({ check_if_challenge_exist })
        if (check_if_challenge_exist) {
            console.log(`Game fight between users already exist`)
            return
        }
        const new_game_fight = await prisma.gameFight.create({
            data: {
                user_acceptor_id: acceptor.id,
                user_initiator_id: userId,
                status: "PENDING"
            }
        })
        console.dir({ new_game_fight })
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
