import { Router } from "express";
import authRoutes from "./auth";
import gameRoutes from "./game";
import chatRoutes from "./chat";
import notificationsRoutes from "./notifications";
import userGamesDataRoutes from "./user_games_data";


const rootRouter: Router = Router();

rootRouter.use('/', authRoutes);
rootRouter.use('/game', gameRoutes)
rootRouter.use('/chat', chatRoutes)
rootRouter.use('/notifications', notificationsRoutes)
rootRouter.use('/gameData', userGamesDataRoutes)

export default rootRouter;