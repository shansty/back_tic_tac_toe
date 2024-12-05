import io from '../my_socket_io_server';
import prisma from '../prisma-client';

export const mainChatSocket = io.of("/main_chat");

mainChatSocket.on("connection", socket => {
    socket.on("start_chat", (user_id: number) => {
        socket.join(user_id.toString());
    })

    socket.on("send_message", async (userId: number, message: string) => {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if(!user) {
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