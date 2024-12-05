import io from '../my_socket_io_server';
import prisma from '../prisma-client';

export const gameChatSocket = io.of("/game_chat");

gameChatSocket.on("connection", socket => {
    socket.on("start_chat", (user_id:number) => {
        console.log(`start_chat.start user_id=${user_id}`)
        socket.join(user_id.toString());
        console.log(`User_is ${user_id} join to room`)
    })

    socket.on("send_message", async (userId: number, gameId: string, message: string) => {
        console.log(`send_message.start`);
        console.dir({userId, gameId, message})

        const game = await prisma.game.findFirst({
            where: {
                id: gameId
            },
            include: {
                game_message: true,
                game_user: true
            }
        })

        if(!game) {
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

        const sender = game.game_user.find(gu => gu.user_id === userId)?.role
        const user_x_id = game.game_user.find(gu => gu.role === "PLAYER_X")?.user_id
        const user_o_id = game.game_user.find(gu => gu.role === "PLAYER_O")?.user_id

        const user_x = await prisma.user.findFirst({
            where: {
                id: user_x_id
            }
        })

        const user_o = await prisma.user.findFirst({
            where: {
                id: user_o_id
            }
        })

        let username:string | undefined;

        sender === "PLAYER_X" ? username = user_x?.user_name : username = username = user_o?.user_name;

        const response = {
            message: new_message.message,
            sender: sender,
            username: username
        }
        
        console.dir({response})
        console.log(`New message added to game history`);

        const user_id = game.game_user.filter(game => game.game_id === gameId).map(gu => gu.user_id)
        if(userId) {
            gameChatSocket.to(user_id[0].toString()).to(user_id[1].toString()).emit("receive_message", response)
        }
    })
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
  });