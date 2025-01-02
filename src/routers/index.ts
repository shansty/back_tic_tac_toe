import { Router } from "express";
import authRoutes from "./auth";
import gameRoutes from "./game";
import chatRoutes from "./chat";
import notificationsRoutes from "./notifications";
import userGamesDataRoutes from "./user_games_data";
import googleOAuthRoutes from "./google_oauth";


const rootRouter: Router = Router();

rootRouter.use('/', authRoutes);
rootRouter.use('/game', gameRoutes)
rootRouter.use('/chat', chatRoutes)
rootRouter.use('/notifications', notificationsRoutes)
rootRouter.use('/gameData', userGamesDataRoutes)
rootRouter.use('/auth/google', googleOAuthRoutes)

export default rootRouter;