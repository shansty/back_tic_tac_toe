import { Request, Response } from 'express';
import { games } from '../datas/games';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";


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