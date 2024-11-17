import io from '../my_socket_io_server';
import { generateRandomString } from '../utils';
import { games } from '../datas/games';
import { Game } from '../types';

const user_ids: string[] = [] 

export const awaitingRoomSocket = io.of("/awaiting_room");

awaitingRoomSocket.on("connection", socket => {
  console.log("DEBUG awaitingRoomSocket connection")
    socket.on("await", (user_id)  => {
        console.dir({ user_id })
        if (user_ids.includes(user_id)) return 

        socket.join(user_id);

        if (user_ids.length > 0) {
            const user_X = user_id;
            const user_O = user_ids[0]
            const gameId = generateRandomString(10);
            console.dir({ gameId })

            const game:Game = {
                gameId: gameId,
                player_x: user_X,
                player_o: user_O,
                x: [],
                o: [] 
            }
            games.push(game)
            awaitingRoomSocket.to(user_O).to(user_X).emit("gameid", { gameId })
            user_ids.shift();
        } else {
            user_ids.push(user_id)
        }
    });    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});