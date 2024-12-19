import io from '../my_socket_io_server';
import prisma from '../prisma-client';
import * as jwt from "jsonwebtoken";
import { IJwtPayloadWithId } from '../interfaces';

export const awaitingRoomSocket = io.of("/awaiting_room");

awaitingRoomSocket.on("connection", socket => {

    const token = socket.handshake.auth.token;
    const secret = process.env.SECRET_KEY;
    if (!token) {
        console.log('token not found await.ts')
        socket.disconnect(true);
    }

    socket.on("await", async (userId: number) => {
        const decoded = jwt.verify(token, secret as string) as IJwtPayloadWithId;
        if (!decoded.id || decoded.id != userId) {
            console.log('Decoded id not found or incorrect')
            socket.disconnect(true);
        }

        const game_users = await prisma.gameUser.findMany({
            where: {
                game_id: null
            }
        })

        const game_user_ids = game_users.map(user => user.user_id);
        if (game_user_ids.includes(userId)) {
            console.log(`Game_user_ids include user_id`)
            return
        }

        socket.join(userId.toString());

        if (game_user_ids.length > 0) {

            const newGame = await prisma.game.create({
                data: {},
            });
            const newGameId = newGame.id;

            let playerX = await prisma.gameUser.create({
                data: {
                    user_id: userId,
                    game_id: newGameId,
                    role: "PLAYER_X"
                }
            });

            let playerO = await prisma.gameUser.findFirst({
                where: {
                    user_id: game_user_ids[0],
                    game_id: null
                }
            });

            if (!playerO) {
                return
            }

            playerO = await prisma.gameUser.update({
                where: { id: playerO.id },
                data: {
                    game_id: newGameId,
                    role: "PLAYER_O"
                }
            })

            awaitingRoomSocket.to(userId.toString()).to(game_user_ids[0].toString()).emit("gameid", newGameId)
            console.log("awaiting_room.await.end")

        } else {
            await prisma.gameUser.create({
                data: {
                    user_id: userId,
                    game_id: null
                }
            })
            console.log("awaiting_room.await.end")
        }
    });

    socket.on("stop_awaiting", async (userId) => {
        console.log("awaiting_room.stop_awaiting.start")
        const game_users = await prisma.gameUser.findMany({
            where: {
                game_id: null
            }
        })

        const game_user_ids = game_users.map(user => user.user_id)
        if (game_user_ids.includes(userId)) {

            let deletePlayer = await prisma.gameUser.findFirst({
                where: {
                    user_id: userId,
                    game_id: null
                }
            });

            if (!deletePlayer) {
                return
            }

            await prisma.gameUser.delete({
                where: {
                    id: deletePlayer.id
                }
            })
        }
    })

    socket.on("join_room", (userId: number) => {
        socket.join(userId.toString())
    })

    socket.on("awaiting_for_rematch", async (userId, gameId) => {
        const game_players = await prisma.gameUser.findMany({
            where: {
                game_id: gameId
            }
        });
        const rival = game_players.filter(gu => gu.user_id !== userId)[0].user_id;
        awaitingRoomSocket.to(rival.toString()).emit("rematch", userId)

    });

    socket.on("start_rematch", async (rivalUser: number, userId: number) => {
        const newGame = await prisma.game.create({
            data: {},
        });
        const newGameId = newGame.id;

        let playerX = await prisma.gameUser.create({
            data: {
                user_id: userId,
                game_id: newGameId,
                role: "PLAYER_X"
            }
        });

        let playerO = await prisma.gameUser.create({
            data: {
                user_id: rivalUser,
                game_id: newGameId,
                role: "PLAYER_O"
            }
        });
        awaitingRoomSocket.to(rivalUser.toString()).to(userId.toString()).emit("gameid", newGameId)
    })


    socket.on("decline_rematch", async (rivalUser: number, userId: number) => {
        awaitingRoomSocket.to(userId.toString()).to(rivalUser.toString()).emit("decline", "Game was declined")
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});