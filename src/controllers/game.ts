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