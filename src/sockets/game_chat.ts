import io from '../my_socket_io_server';
import { games } from '../datas/games';
import { Sender } from '../enum';

export const gameChatSocket = io.of("/game_chat");

gameChatSocket.on("connection", socket => {
    socket.on("start_chat", (user_id:string) => {
        console.log(`start_chat.start user_id=${user_id}`)
        socket.join(user_id);
        console.log(`User_is ${user_id} join to room`)
    })
    socket.on("send_message", (sender: Sender, userId: string, gameId: string, message: string) => {
        console.log(`send_message.start`);
        console.dir({sender, userId, gameId, message})

        const game = games.find(g => g.gameId === gameId)
        if(!game) {
            return;
        }
        game.messageHistory = game.messageHistory || []; 
        const newMessage = {message, sender}

        console.dir({newMessage})
        game.messageHistory.push(newMessage);

        console.log(`New message added to game history`);
        gameChatSocket.to(game.player_x).to(game.player_o).emit("receive_message", newMessage)
    })
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
  });