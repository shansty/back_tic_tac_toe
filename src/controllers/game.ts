import { Request, Response } from 'express';
import { games } from '../datas/games';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";
import io from '../my_socket_io_server';


//gamesNamespace.on("connection", (socket) => {
    // socket.on("step", ({ index_of_board, gameid, userId }) => {
    //     // get game id and get user id
    //     // validate game and user data
    //     // update game status
    //     const newGameDate = game // updated game
    //     socket.to(game.gameId).emit("move", {game})
    //   })
    // })

const gamesSocket = io.of("/games");

gamesSocket.on("connection", socket => {
    socket.on("updating_game", (index, gameId, user_id)  => {

        console.dir({index, gameId, user_id})

        let game = games.find(el => el.gameId == gameId) 
        if(game) {
            if(user_id == game.player_x) {
                game.x.push(index)
                gamesSocket.emit('move', game, "X")
            }
            if(user_id == game.player_o) {
                game.o.push(index)
                gamesSocket.emit('move', game, "O")
            }
        }
    });    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

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

export const updateGame =  (req: Request, res: Response) => { 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const id = req.params.id;
    const { gameId, o, x } = req.body
    console.log({ gameId, o, x })
    try {
        if (!token) {
            throw new Error("Token not provided");
        }

        jwt.verify(token, secretKey, (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ message: err.message });
                return;
            } else {
                if (id == decoded.id) {
                    let game = games.find(el => el.gameId == gameId) 
                    if(x != undefined) {
                        game?.x.push(x)
                    }
                    if(o != undefined) {
                       game?.o.push(o)
                    }
                    console.log(game)
                    res.json({game: game})
                
                    
                } else {
                    res.status(403).json({ message: "Unauthorized" });
                }
            }
        });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};