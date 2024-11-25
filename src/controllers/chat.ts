import { Request, Response } from 'express';
import { games } from '../datas/games';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";


export const getUserRoleForChat = (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const gameId:string = req.body.gameId;
    const userId = req.params.id;
    try {
        if (!token) {
            res.status(401).json({message: "Unauthorized"})
        }

        jwt.verify(token as string, secretKey, (err: Error | null, decoded: any) => {
            if (err) {
                res.status(403).json({ message: err.message });
                return;
            } else {
                const game = games.find(el => el.gameId == gameId) 
                console.log(`AXIOS game == ${game} and gameId == ${gameId}`)
                if(game) {
                    if(userId == game.player_x) {
                        console.log("user_id = X")
                        res.status(200).json({userRole: "player_x",})
                    } else if(userId == game.player_o) {
                        console.log("user_id = O")
                        res.status(200).json({userRole: "player_o"})
                    } else {
                        res.status(404).json({message: "In the game there isn't userId"})
                    }
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