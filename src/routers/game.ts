import { Router } from "express";
import { updateGame, getGameResults } from "../controllers/game";

const gameRoutes:Router = Router();

gameRoutes.put('/:id', updateGame)
gameRoutes.get('/:gameId', getGameResults)

export default gameRoutes;