import { Router } from "express";
import { getUserRoleForChat, getGameChatMessages } from "../controllers/chat";
import authMiddleware from "../middlewares/auth";

const chatRoutes:Router = Router();

chatRoutes.post('/:id', [authMiddleware], getUserRoleForChat)
chatRoutes.get('/:gameId', [authMiddleware], getGameChatMessages)

export default chatRoutes;