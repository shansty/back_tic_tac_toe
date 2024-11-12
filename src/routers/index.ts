import { Router } from "express";
import authRoutes from "./auth";
import mainRoutes from "./main";
import gameRoutes from "./game";


const rootRouter: Router = Router();

rootRouter.use('/', authRoutes);
rootRouter.use('/main', mainRoutes)
rootRouter.use('/game', gameRoutes)

export default rootRouter;