import { Request, Response } from 'express';
import prisma from '../prisma-client';
import { createOrUpdateGameBoardSheet } from './google_sheets';
import { GameUser } from '@prisma/client';


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



export const completeGame = async (req: Request, res: Response) => {
    const userId = +req.params.id;
    const gameId: string = req.body.gameId;
    const winner: string = req.body.winner;
    const winnerIndexes: number[] = req.body.winnerIndexes;


    const game_users = await prisma.gameUser.findMany({
        where: {
            game_id: gameId,
        },
    })

    const game_user = game_users.find(user => user.user_id === userId)
    const game_user_rival = game_users.find(gu => gu !== game_user)

    let { arr_x, arr_o } = await getArrXArrOIndexes(game_users, userId, gameId)

    const user = await prisma.user.findFirst({
        where: {
            id: game_user?.user_id
        }
    })
    const rival_user = await prisma.user.findFirst({
        where: {
            id: game_user_rival?.user_id
        }
    })

    const sheetName = `${rival_user?.user_name} number ${gameId} `

    if (user?.google_id) {
        createOrUpdateGameBoardSheet(user.id, sheetName, arr_x, arr_o, winnerIndexes)
    }

    changeNumberOfUserWinningGames(winner, game_user as GameUser, game_user_rival as GameUser)
    const result = await changeGameFightStatus(userId, gameId);
    if (!result.status) {
        return res.status(200).json({ message: result.message });
    }
    return res.status(200).json({ message: result.message });
};




const changeGameFightStatus = async (userId: number, gameId: string) => {
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
        if (!completed_game_fight) {
            return { status: false, message: "This is not a challenge game." };
        }
        return { status: true, message: "Game fight already completed." };
    }

    await prisma.gameFight.update({
        where: {
            id: game_fight.id
        },
        data: {
            status: "COMPLETED"
        }
    });
    return { status: true, message: "Game fight status updated to COMPLETED." };
}



const changeNumberOfUserWinningGames = async (winner: string, game_user: GameUser, game_user_rival: GameUser) => {

    if (winner === "") {
        return;
    }
    if (winner === "X") {
        if (game_user?.role === "PLAYER_X") {

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
            return;
        } else {

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
            return;
        }
    }

    if (winner === "O") {
        if (game_user?.role === "PLAYER_O") {

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
            return;

        } else {

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
            return;
        }
    }

}



const getArrXArrOIndexes = async (game_users: GameUser[], userId: number, gameId: string) => {
    const game_user = await prisma.gameUser.findFirst({
        where: {
            user_id: userId,
            game_id: gameId,
        },
        include: {
            game_move: true,
        }
    })
    const game_user_rival = game_users.find(gu => gu.user_id != userId)

    let arr_x: number[] = [];
    let arr_o: number[] = [];

    const game_user_move_indexes = game_user?.game_move.map(game_move => game_move.move_index)
    const game_user_rival_moves = await prisma.gameMove.findMany({
        where: {
            game_id: gameId,
            game_user_id: game_user_rival?.id
        }
    })
    const game_user_rival_move_indexes = game_user_rival_moves.map(game_move => game_move.move_index)

    if (game_user?.role === "PLAYER_X") {
        arr_x.push(...(game_user_move_indexes as number[]));
        console.log(`arr_x if game user is X: ${arr_x}`);
    } else {
        arr_o.push(...(game_user_move_indexes as number[]));
        console.log(`arr_o if game user is O: ${arr_o}`);
    }

    if (game_user_rival?.role === "PLAYER_X") {
        arr_x.push(...(game_user_rival_move_indexes as number[]));
        console.log(`arr_x if game user rival is X: ${arr_x}`);
    } else {
        arr_o.push(...(game_user_rival_move_indexes as number[]));
        console.log(`arr_o if game user is O: ${arr_o}`);
    }
    console.dir({ arr_x, arr_o })

    return {
        arr_x,
        arr_o
    };
}
