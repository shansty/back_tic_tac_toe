import io from '../my_socket_io_server';
import prisma from '../prisma-client';
import * as jwt from "jsonwebtoken";
import { IJwtPayloadWithId } from '../interfaces';

export const mainChatSocket = io.of("/main_chat");

mainChatSocket.on("connection", socket => {

    const token = socket.handshake.auth.token;
    const secret = process.env.SECRET_KEY;
    if (!token) {
        console.log('token not found main_chat.ts')
        socket.disconnect(true);
    }

    socket.on("start_chat", (userId: number) => {
        const decoded = jwt.verify(token, secret as string) as IJwtPayloadWithId;
        if (!decoded.id || decoded.id != userId) {
            console.log('Decoded id not found or incorrect')
            socket.disconnect(true);
        }
        socket.join(userId.toString());
    })

    socket.on("send_message", async (userId: number, message: string) => {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            socket.emit('error-event', { message: 'User not found', code: 404 });
            return;
        }

        await prisma.chatMessage.create({
            data: {
                message: message,
                user_id: userId,

            }
        })

        const data = {
            message: message,
            username: user.user_name
        }

        mainChatSocket.emit('receive_message', data);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});