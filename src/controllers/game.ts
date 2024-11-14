import { Request, Response } from 'express';
import { games } from '../datas/games';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";
import io from '../my_socket_io_server';

// const gamesSocket = io.of("/games");

// gamesSocket.on("connection", socket => {

//   socket.on("start_game", (user_id) => {
//     console.log("START GAME")
//     console.dir({ user_id})
//     socket.join(user_id)
//   })

//   socket.on("move", (gameId, user_id, index)  => {

//     console.dir({index, gameId, user_id})

//     const game = games.find(g => g.gameId === gameId)

//     console.dir({ game })

//     if (!game) return // TODO: handle error
//     if (![game.player_o, game.player_x].includes(user_id)) return // TODO handle error

//     if (game.player_x === user_id) {
//       if ((game.x.length + game.o.length) % 2 === 1) return // TODO: handle error (step "o")
//       console.log("push to x")
//       game.x.push(index) 
//     }

//     if (game.player_o === user_id) {
//       if ((game.x.length + game.o.length) % 2 === 0) return // TODO: handle error (step "x")
//       console.log("push to o")
//       game.o.push(index)
//     }

//     gamesSocket.to(game.player_x).to(game.player_o).emit(`update-${gameId}`, game)
//   });    
  
//   socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//   });
// });

export const getGameResults = (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const gameId = req.params.gameId;
    try {
        if (!token) {
            throw new Error("Token not provided");
        }

        jwt.verify(token, secretKey, (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ message: err.message });
                return;
            } else {
                const game = games.find(el => el.gameId == gameId) 
                if(game) {
                    res.json({game: game})
                } else {
                    res.status(404).json({message: "No game with such gameId"})
                }
            }
        });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
}