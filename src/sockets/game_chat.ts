import io from '../my_socket_io_server';
import prisma from '../prisma-client';
import * as jwt from "jsonwebtoken";
import { IJwtPayloadWithId } from '../interfaces';

export const gameChatSocket = io.of("/game_chat");

gameChatSocket.on("connection", socket => {

    const token = socket.handshake.auth.token;
    const secret = process.env.SECRET_KEY;
    if (!token) {
        console.log('token not found game_chat.ts')
        socket.disconnect(true);
    }

    socket.on("start_chat", (userId: number) => {
        console.log(`Game chat start_chat`)
        const decoded = jwt.verify(token, secret as string) as IJwtPayloadWithId;
        if (!decoded.id || decoded.id != userId) {
            console.log('Decoded id not found or incorrect')
            socket.disconnect(true);
        }
        console.log(`User ${userId} is joining room`);
        socket.join(userId.toString());
    })


    socket.on("send_message", async (userId: number, gameId: string, message: string) => {
        console.log(`send_message.start`);

        const game = await prisma.game.findFirst({
            where: {
                id: gameId
            },
            include: {
                game_message: true,
                game_user: true
            }
        })

        if (!game) {
            socket.emit('error-event', { message: 'Game not found', code: 404 });
            return;
        }

        const new_message = await prisma.gameMessage.create({
            data: {
                user_id: userId,
                message: message,
                game_id: gameId
            }
        })

        const senderRole = game.game_user.find(gu => gu.user_id === userId)?.role
        const userIds = game.game_user.map(gu => gu.user_id)

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })

        const response = {
            message: new_message.message,
            sender: senderRole,
            username: user?.user_name
        };

        console.dir({ response })
        console.log(`New message added to game history`);
        console.log('Broadcasting message to users:', userIds);

        userIds.forEach(room => {
            gameChatSocket.to(room.toString()).emit("receive_message", response);
        });









        // console.dir({ response })
        // console.log(`New message added to game history`);

        // const user_ids = game.game_user.filter(game => game.game_id === gameId).map(gu => gu.user_id)
        // console.log(user_ids)

        // console.log('Debug before emit 1')
        // const check_room = socket.rooms.has(user_ids[0].toString())
        // console.dir({check_room})

        // console.log('Debug before emit 2')
        // const check_room1 = socket.rooms.has(user_ids[1].toString())
        // console.dir({check_room1})

        // gameChatSocket.to(user_ids[0].toString()).to(user_ids[1].toString()).emit("receive_message", response)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});