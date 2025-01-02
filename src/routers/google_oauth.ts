import { Router } from "express";
import { generateURL, getUserInfo } from "../controllers/google_oauth";

const googleOAuthRoutes:Router = Router();

googleOAuthRoutes.post('/',  generateURL)
googleOAuthRoutes.get('/',  getUserInfo)

export default googleOAuthRoutes;