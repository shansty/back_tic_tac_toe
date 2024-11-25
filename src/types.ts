import { Sender } from "./enum";

export type TypeGame = {
    gameId: string;
    player_x: string;
    player_o: string;
    x: number[];
    o: number[];
    messageHistory?: { message: string; sender: Sender }[];
}

export type TypeUser = {
    id: number;
    email: string;
    password: string;
}