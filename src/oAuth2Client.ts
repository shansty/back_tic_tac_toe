import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import prisma from "./prisma-client";

const redirectURL = "http://localhost:3001/auth/google";

export const getAuthenticatedClientForUser = async (userId: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.access_token || !user.refresh_token) {
        console.log("User not authenticated or missing tokens")
        return;
    }

    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectURL
    );

    oAuth2Client.setCredentials({
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        scope: user.scope as string,
        token_type: user.token_type,
        id_token: user.id_token,
        expiry_date: Number(user.expiry_date), 
    });
    
    
    oAuth2Client.on("tokens", async (tokens) => {
        if (tokens.refresh_token) {
            await prisma.user.update({
                where: { id: userId },
                data: { refresh_token: tokens.refresh_token },
            });
        }

        if (tokens.access_token) {
            await prisma.user.update({
                where: { id: userId },
                data: { access_token: tokens.access_token, expiry_date: tokens.expiry_date },
            });
        }
    });

    return oAuth2Client;
};