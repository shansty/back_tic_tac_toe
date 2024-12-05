import { Router } from "express";
import { getGameResults } from "../controllers/game";
import authMiddleware from "../middlewares/auth";

const gameRoutes:Router = Router();

gameRoutes.get('/:gameId', [authMiddleware], getGameResults)

export default gameRoutes;