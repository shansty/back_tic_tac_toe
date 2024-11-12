import { Router } from "express";
import { sighUp, signIn } from "../controllers/auth";

const authRoutes:Router = Router();

authRoutes.post('/register', sighUp)
authRoutes.post('/login', signIn)

export default authRoutes;