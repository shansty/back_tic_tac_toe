import { Router } from "express";
import authRoutes from "./auth";
import gameRoutes from "./game";
import chatRoutes from "./chat";


const rootRouter: Router = Router();

rootRouter.use('/', authRoutes);
rootRouter.use('/game', gameRoutes)
rootRouter.use('/chat', chatRoutes)

export default rootRouter;