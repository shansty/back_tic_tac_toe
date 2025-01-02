import { Request, Response } from 'express';
import prisma from '../prisma-client';


export const getGameResults = async (req: Request, res: Response) => {

    const gameId = req.params.gameId;
    let game = await prisma.game.findFirst({
        where: {
            id: gameId
        },
        include: {
            game_move: true,
            game_user: true
        }
    })
    if (game) {
        res.status(200).json({ game: game })
    } else {
        res.status(404).json({ message: "No game with such gameId" })
    }
}