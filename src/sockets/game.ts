import io from '../my_socket_io_server';
import prisma from '../prisma-client';
import * as jwt from "jsonwebtoken";
import { IJwtPayloadWithId } from '../interfaces';

export const gamesSocket = io.of("/games");

gamesSocket.on("connection", socket => {

    const token = socket.handshake.auth.token;
    const secret = process.env.SECRET_KEY;
    if (!token) {
        console.log('token not found game.ts')
        socket.disconnect(true);
    }
    socket.on("start_game", async (userId: number, gameId: string) => {
        const decoded = jwt.verify(token, secret as string) as IJwtPayloadWithId;
        if (!decoded.id || decoded.id != userId) {
            console.log('Decoded id not found or incorrect')
            socket.disconnect(true);
        }

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
        const game_user = game.game_user.find(gu => gu.user_id === userId);
        const second_game_user = game.game_user.find(gu => gu.user_id !== userId);

        if (!game_user || !second_game_user) {
            socket.emit('error-event', { message: 'One or two users not found', code: 404 });
            return;
        }

        if (game_user.role === "PLAYER_X") {
            gamesSocket.to(userId.toString()).emit("determining_the_order_of_moves", "You are player X")
        }

        if (game_user.role === "PLAYER_O") {
            gamesSocket.to(userId.toString()).emit("determining_the_order_of_moves", "You are player O")
        }

        if ((game.game_move.length % 2) === 0) {
            gamesSocket.to(second_game_user.user_id.toString()).to(userId.toString()).emit(`order_of_move`, "X")
        }

        if ((game.game_move.length % 2) === 1) {
            gamesSocket.to(second_game_user.user_id.toString()).to(userId.toString()).emit(`order_of_move`, "O")
        }
        console.log("games.start_game.end")

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

        if (!game) {
            return
        }

        const game_players = game.game_user;

        if (game_players.length != 2) {
            socket.emit('error-event', { message: 'One or two users not found', code: 404 });
            return;
        }

        const currect_user = game.game_user.find(el => el.user_id === user_id);

        if (!currect_user) {
            return;
        }
        console.dir(game.game_move.length)

        const taken_move = await prisma.gameMove.findFirst({
            where: {
                move_index: index,
                game_id: gameId
            }
        })

        if (currect_user.role === "PLAYER_X") {

            if ((game.game_move.length % 2) === 1) return
            if (taken_move) return

            const move = await prisma.gameMove.create({
                data: {
                    game_id: gameId,
                    game_user_id: currect_user.id,
                    move_index: index
                }
            })
            game.game_move.push(move)

            gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`order_of_move`, "O")
        }

        if (currect_user.role === "PLAYER_O") {

            if ((game.game_move.length % 2) === 0) return
            if (taken_move) return

            const move = await prisma.gameMove.create({
                data: {
                    game_id: gameId,
                    game_user_id: currect_user.id,
                    move_index: index
                }
            })
            game.game_move.push(move)

            gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`order_of_move`, "X")
        }

        console.log("game.move.end")
        gamesSocket.to(game_players[0].user_id.toString()).to(game_players[1].user_id.toString()).emit(`update-${gameId}`, game)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
