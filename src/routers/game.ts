import { Router } from "express";
import { getGameResults } from "../controllers/game";

const gameRoutes:Router = Router();

gameRoutes.get('/:gameId', getGameResults)

export default gameRoutes;