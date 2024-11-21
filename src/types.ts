import { Sender } from "./enum";

export interface Game {
    gameId: string;
    player_x: string;
    player_o: string;
    x: number[];
    o: number[];
    messageHistory?: { message: string; sender: Sender }[];
}