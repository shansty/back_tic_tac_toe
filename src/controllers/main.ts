import { Request, Response } from 'express';
import { games } from '../datas/games';
import { Game } from '../types';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";
import { generateRandomString } from '../utils';
import io from '../my_socket_io_server';

const users_ids: string[] = [] 

const awaitingRoomSocket = io.of("/awaiting_room");

awaitingRoomSocket.on("connection", socket => {
    socket.on("await", (user_id)  => {
        socket.join(user_id);
    
        if (users_ids.length > 0) {
            const user_X = user_id;
            const user_O = users_ids[0]
            const gameId = generateRandomString(10);
            console.dir({ gameId })
            awaitingRoomSocket.to(user_O).to(user_X).emit("gameid", { gameId, user_X, user_O })
            users_ids.shift();
        } else {
            users_ids.push(user_id)
        }
    });    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


export const createGame =  (req: Request, res: Response) => { 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const id = req.params.id;
    const {gameId, user_X, user_O} = req.body;
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
                    const game:Game = {
                        gameId: gameId,
                        player_x: user_X,
                        player_o: user_O,
                        x: [],
                        o: [] 
                    }
                    games.push(game)
                    res.json({ game: game });
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