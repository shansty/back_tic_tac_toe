import io from '../my_socket_io_server';
import prisma from '../prisma-client';
import { gameChatSocket } from './game_chat';

export const gamesSocket = io.of("/games");

gamesSocket.on("connection", socket => {

    socket.on("start_game", async (userId: number, gameId: string) => {
        console.log("games.start_game.start")

        socket.join(userId.toString())

        const game = await prisma.game.findFirst({
            where: {
                id: gameId
            },
            include: {
                game_user: true,
                game_move: true,
            }
        })

        if (!game) {
            socket.emit('error-event', { message: 'Game not found', code: 404 });
            return;
        }
        console.dir({game})
        const game_user = game.game_user.find(gu => gu.user_id === userId);
        console.dir({game_user})
        const second_game_user = game.game_user.find(gu => gu.user_id !== userId);
        console.dir({second_game_user})


        if (!game_user || !second_game_user) {
            console.log("DEBUG 1")
            socket.emit('error-event', { message: 'One or two users not found', code: 404 });
            return;
        }

        if (game_user.role === "PLAYER_X") {
            console.log("DEBUG 3")
            gamesSocket.to(userId.toString()).emit("determining_the_order_of_moves", "You are player X")
        }

        if (game_user.role === "PLAYER_O") {
            console.log("DEBUG 4")
            gamesSocket.to(userId.toString()).emit("determining_the_order_of_moves", "You are player O")
        }

        if ((game.game_move.length % 2) === 0) {
            gamesSocket.to(second_game_user.user_id.toString()).to(userId.toString()).emit(`order_of_move`, "X")
        }

        if ((game.game_move.length % 2) === 1) {
            gamesSocket.to(second_game_user.user_id.toString()).to(userId.toString()).emit(`order_of_move`, "O")
        }

    })



    socket.on("move", async (gameId: string, user_id: number, index: number) => {
        console.log("game.move.start")

        const game = await prisma.game.findFirst({
            where: {
                id: gameId,
            },
            include: {
                game_user: true,
                game_move: true,
            }
        })
        console.dir({ game }, { depth: 10 })

        if (!game) {
            return
        }

        const game_players = game.game_user;
        console.dir({ game_players })

        if (game_players.length != 2) {
            socket.emit('error-event', { message: 'One or two users not found', code: 404 });
            return;
        }

        const currect_user = game.game_user.find(el => el.user_id === user_id);
        console.dir({ currect_user })


        if (!currect_user) {
            return;
        }
        console.dir(game.game_move.length)

        const taken_move = await prisma.gameMove.findFirst({
            where: {
                move_index:index,
                game_id: gameId
            }
        })

        if (currect_user.role === "PLAYER_X") {

            if ((game.game_move.length % 2) === 1) return
            if(taken_move) return

            const move = await prisma.gameMove.create({
                data: {
                    game_id: gameId,
                    game_user_id: currect_user.id,
                    move_index: index
                }
            })
            game.game_move.push(move)
            console.log(`DEBUG 1`)
            console.log(game.game_move.length)

            gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`order_of_move`, "O")
        }

        if (currect_user.role === "PLAYER_O") {

            if ((game.game_move.length % 2) === 0) return
            if(taken_move) return

            const move = await prisma.gameMove.create({
                data: {
                    game_id: gameId,
                    game_user_id: currect_user.id,
                    move_index: index
                }
            })
            game.game_move.push(move)
            console.log(`DEBUG 2`)
            console.log(game.game_move.length)

            gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`order_of_move`, "X")
        }

        console.dir({ game }, { depth: 10 })
        gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`update-${gameId}`, game)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
