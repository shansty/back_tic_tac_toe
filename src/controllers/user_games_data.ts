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
    const gameId: string = req.body.gameId;
    const winner: string = req.body.winner;
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
                game_id: gameId,
                status: "IN_PROCESS"
            },
        }
    });

    if (!game_fight) {
        const completed_game_fight = await prisma.gameFight.findFirst({
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
                    game_id: gameId,
                    status: "COMPLETED"
                },
            }
        });
        if(!completed_game_fight) {
            return res.status(200).json({ message: "This is not challenge game." });
        }
        return res.status(200).json({ message: "Game fight already completed." });
    }

    await prisma.gameFight.update({
        where: {
            id: game_fight.id
        },
        data: {
            status: "COMPLETED"
        }
    });

    const game_users = await prisma.gameUser.findMany({
        where: {
            game_id: gameId,
        }
    })

    const game_user = await prisma.gameUser.findFirst({
        where: {
            user_id: userId,
            game_id: gameId,
        }
    })

    const game_user_rival = game_users.find(gu => gu !== game_user)

    if (winner === "") {

        console.log("DEGUG 1")
        console.dir({winner})

        res.status(200).json({ status: "COMPLETED" })
    }
    if(winner === "X") {
        if(game_user?.role === "PLAYER_X") {

            console.log("DEGUG 2")
            console.dir({winner})
            console.dir({game_user})


            await prisma.user.update({
                where: {
                    id: game_user.user_id
                },
                data: {
                    winner_games: {
                        increment: 1
                    }
                }
            });
            res.status(200).json({ status: "COMPLETED" })
        }  else {

            console.log("DEGUG 3")
            console.dir({winner})
            console.dir({game_user_rival})

            await prisma.user.update({
                where: {
                    id: game_user_rival?.user_id
                },
                data: {
                    winner_games: {
                        increment: 1
                    }
                }
            });
            res.status(200).json({ status: "COMPLETED" })
        }
    }

    if(winner === "O") {
        if(game_user?.role === "PLAYER_O") {

            console.log("DEGUG 4")
            console.dir({winner})
            console.dir({game_user})


            await prisma.user.update({
                where: {
                    id: game_user.user_id
                },
                data: {
                    winner_games: {
                        increment: 1
                    }
                }
            });
            res.status(200).json({ status: "COMPLETED" })
        }  else {

            console.log("DEGUG 4")
            console.dir({winner})
            console.dir({game_user_rival})

            await prisma.user.update({
                where: {
                    id: game_user_rival?.user_id
                },
                data: {
                    winner_games: {
                        increment: 1
                    }
                }
            });
            res.status(200).json({ status: "COMPLETED" })
        }
    }
    
};
