import { Router } from "express";
import { getNotifications, declineNotifications, acceptNotifications } from "../controllers/notifications";
import authMiddleware from "../middlewares/auth";

const notificationsRoutes:Router = Router();

notificationsRoutes.get('/:id', [authMiddleware], getNotifications)
notificationsRoutes.put('/:id', [authMiddleware], declineNotifications)
notificationsRoutes.put('/accept/:id', [authMiddleware], acceptNotifications)

export default notificationsRoutes;