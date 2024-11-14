import { Router } from "express";
import authRoutes from "./auth";
import gameRoutes from "./game";


const rootRouter: Router = Router();

rootRouter.use('/', authRoutes);
rootRouter.use('/game', gameRoutes)

export default rootRouter;