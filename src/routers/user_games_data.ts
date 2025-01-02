import { Router } from "express";
import { getUserGamesData, completeGame } from "../controllers/user_games_data";
import authMiddleware from "../middlewares/auth";

const userGamesDataRoutes:Router = Router();

userGamesDataRoutes.get('/:id',[authMiddleware], getUserGamesData)
userGamesDataRoutes.put('/:id',[authMiddleware], completeGame)

export default userGamesDataRoutes;