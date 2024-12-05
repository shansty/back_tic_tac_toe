import { Router } from "express";
import { getUserGamesData, changeGameFightStatus } from "../controllers/user_games_data";
import authMiddleware from "../middlewares/auth";

const userGamesDataRoutes:Router = Router();

userGamesDataRoutes.get('/:id',[authMiddleware], getUserGamesData)
userGamesDataRoutes.put('/:id',[authMiddleware], changeGameFightStatus)

export default userGamesDataRoutes;