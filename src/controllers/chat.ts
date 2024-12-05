import { Request, Response } from 'express';
import prisma from '../prisma-client';


export const getUserRoleForChat = async (req: Request, res: Response) => {
    const gameId: string = req.body.gameId;
    const userId = req.params.id;

    const game = await prisma.game.findFirst({
        where: {
            id: gameId
        },
        include: {
            game_message: true,
            game_user: true
        }
    })
    if (!game) {
        res.status(404).json({ message: "Game not found" })
        return;
    }
    console.log(`AXIOS game == ${game} and gameId == ${gameId}`)
    const user_role = game.game_user.find(gu => gu.user_id === +userId)?.role

    if (user_role) {
        res.status(200).json({ user_role: user_role })
    } else {
        res.status(404).json({ message: "In the game there isn't userId" })
    }
}


export const getGameChatMessages = async (req: Request, res: Response) => {
    const gameId: string = req.params.gameId;


    const game = await prisma.game.findFirst({
        where: {
            id: gameId
        },
        include: {
            game_message: true,
            game_user: true
        }
    })
    if (!game) {
        res.status(403).json({ message: "Game not found" });
        return;
    }
    const game_messages = game.game_message;
    const user_x_id = game.game_user.find(gu => gu.role === "PLAYER_X")?.user_id;
    const user_o_id = game.game_user.find(gu => gu.role === "PLAYER_O")?.user_id;
    const user_x = await prisma.user.findFirst({
        where: {
            id: user_x_id
        }
    })
    const user_o = await prisma.user.findFirst({
        where: {
            id: user_o_id
        }
    })
    let game_history = [];

    for (let i = 0; i < game_messages.length; i++) {
        if (game_messages[i].user_id === user_x_id) {
            let newEntry = {
                message: game_messages[i].message,
                username: user_x?.user_name,
                sender: "PLAYER_X"
            };
            game_history[i] = newEntry;
        } else {
            let newEntry = {
                message: game_messages[i].message,
                username: user_o?.user_name,
                sender: "PLAYER_O"
            };
            game_history[i] = newEntry;
        }
    }
    console.dir({ game_history })
    res.status(200).json({ game_history: game_history })
}