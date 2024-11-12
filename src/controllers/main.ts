import { Request, Response } from 'express';
import { games } from '../datas/games';
import { Game } from '../types';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";
import { generateRandomString } from '../utils';


export const createGame =  (req: Request, res: Response) => { 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const id = req.params.id;
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
                    const gameId = generateRandomString(10);
                    const game:Game = {
                        gameId: gameId,
                        player_x: id,
                        // как-то нужно указать id второго игрока
                        player_o: 'O',
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