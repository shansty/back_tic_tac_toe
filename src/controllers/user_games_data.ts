import { Request, Response } from 'express';
import prisma from '../prisma-client';


export const getUserGamesData = async (req: Request, res: Response) => {
    const userId = +req.params.id;
    const games = await prisma.gameFight.findMany({
        where: {
            OR: [
                {
                    user_acceptor_id: userId,
                },
                {
                    user_initiator_id: userId,
                }
            ],
            AND: {
                NOT: {
                    OR: [
                        {
                            status: "PENDING",
                        },
                        {
                            status: "REJECTED",
                        }
                    ]
                }
            }
        }
    })
    if (!games) {
        res.status(200).json({ games: [] })
    }
    let games_with_position = [];

    for (let element of games) {
        if (element.user_acceptor_id === userId) {
            const rival_user = await prisma.user.findFirst({
                where: {
                    id: element.user_initiator_id
                }
            })
            games_with_position.push({
                game_status: element.status,
                game_link: `http://localhost:3000/game/${element.game_id}`,
                rival_username: rival_user?.user_name,
                position: "ACCEPTOR"
            })
        } else {
            const rival_user = await prisma.user.findFirst({
                where: {
                    id: element.user_acceptor_id
                }
            })
            games_with_position.push({
                game_status: element.status,
                game_link: `http://localhost:3000/game/${element.game_id}`,
                rival_username: rival_user?.user_name,
                position: "INITIATOR"
            })
        }
    }
    res.status(200).json({ games: games_with_position })
};


export const changeGameFightStatus = async (req: Request, res: Response) => {
    const userId = +req.params.id;
    const gameId = req.body.gameId
    const game_fight = await prisma.gameFight.findFirst({
        where: {
            OR: [
                {
                    user_acceptor_id: userId,
                },
                {
                    user_initiator_id: userId,
                }
            ],
            AND: {
                game_id: gameId
            }
        }
    });

    if (!game_fight) {
        return res.status(404).json({ message: "Game fight not found." });
    }
    const update_game_fight = await prisma.gameFight.update({
        where: {
            id: game_fight.id
        },
        data: {
            status: "COMPLETED"
        }
    });
    res.status(200).json({ status: "COMPLETED" })
};
