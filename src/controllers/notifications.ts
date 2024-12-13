import { Request, Response } from 'express';
import prisma from '../prisma-client';


export const getNotifications = async (req: Request, res: Response) => {

    const userId = +req.params.id;

    const game_fights = await prisma.gameFight.findMany({
        where: {
            user_acceptor_id: userId,
            status: "PENDING"
        },
    })
    if (!game_fights) {
        res.status(200).json({ notifications: [] })
        console.log("Pending game fights are empty")
        return;
    }

    const rival_users_id = game_fights.map(game_fight => game_fight.user_initiator_id)
    const rival_users = await Promise.all(
        rival_users_id.map(id => prisma.user.findFirst({ where: { id } }))
    );
    let notifications = [];

    for (let element of rival_users) {
        notifications.push({
            text: `User ${element?.user_name} wants to challenge you. Accept the challenge?`,
            rival_username: element?.user_name
        })
    }
    console.dir({ notifications })
    res.status(200).json({ notifications: notifications })
};



export const declineNotifications = async (req: Request, res: Response) => {

    const userId = +req.params.id;
    const rival_username: string = req.body.rival_username;

    const rival_user = await prisma.user.findFirst({
        where: {
            user_name: rival_username
        }
    })
    if (!rival_user) {
        res.status(404).json({ message: "Rival not found." });
        return;
    }
    const game_fight = await prisma.gameFight.updateMany({
        where: {
            user_initiator_id: rival_user.id,
            user_acceptor_id: userId,
            status: "PENDING"
        },
        data: {
            status: "REJECTED"
        }
    });
    res.status(200).json({ message: "challenge was decline" })
};



export const acceptNotifications = async (req: Request, res: Response) => {

    const userId = +req.params.id;
    const rival_username: string = req.body.rival_username;
    console.dir({ rival_username })

    const rival_user = await prisma.user.findFirst({
        where: {
            user_name: rival_username
        }
    })
    if (!rival_user) {
        res.status(404).json({ message: "Rival not found." });
        return;
    }
    const newGame = await prisma.game.create({
        data: {},
    });
    const game_fight = await prisma.gameFight.updateMany({
        where: {
            user_initiator_id: rival_user.id,
            user_acceptor_id: userId,
            status: "PENDING"
        },
        data: {
            game_id: newGame.id,
            status: "IN_PROCESS"
        }
    });

    const player_x = await prisma.gameUser.create({
        data: {
            game_id: newGame.id,
            user_id: rival_user.id,
            role: "PLAYER_X"
        }
    })

    const player_o = await prisma.gameUser.create({
        data: {
            game_id: newGame.id,
            user_id: userId,
            role: "PLAYER_O"
        }
    })

    res.status(200).json({ game_fight: game_fight })
};
