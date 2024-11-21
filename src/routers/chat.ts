import { Router } from "express";
import { getUserRoleForChat } from "../controllers/chat";

const chatRoutes:Router = Router();

chatRoutes.post('/:id', getUserRoleForChat)

export default chatRoutes;