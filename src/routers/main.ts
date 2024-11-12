import { Router } from "express";
import { createGame } from "../controllers/main";

const mainRoutes:Router = Router();

mainRoutes.get('/:id', createGame)

export default mainRoutes;