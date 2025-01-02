import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from "jsonwebtoken";
import prisma from '../prisma-client';


type TypeResponseData = {
    sub: string,
    name: string,
    given_name: string,
    family_name: string,
    picture: string,
    email: string,
    email_verified: boolean
}


export const generateURL = async (req: Request, res: Response) => {

    try {
        res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
        res.header("Access-Control-Allow-Credentials", 'true');
        res.header("Referrer-Policy", "no-referrer-when-downgrade");
        const redirectURL = 'http://localhost:3001/auth/google';

        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
        )
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/drive.file",
                "https://www.googleapis.com/auth/spreadsheets",
                "openid"
            ],
            prompt: 'consent'
        })
        res.json({ url: authorizeUrl });
    } catch (err) {
        console.log(err)
    }
}


export const getUserInfo = async (req: Request, res: Response) => {
    const code = req.query.code;
    try {

        const redirectURL = 'http://localhost:3001/auth/google';

        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
        )
        const response = await oAuth2Client.getToken(code as string);
        await oAuth2Client.setCredentials(response.tokens);
        const user_credential = oAuth2Client.credentials;

        console.dir({ user_credential })
        if (!user_credential.access_token) {
            return res.status(401).json({ message: "No user access token" });
        }
        const user_data = await getUserData(user_credential.access_token);
        console.dir({ user_data })

        const registered_user = await prisma.user.findFirst({
            where: {
                email: user_data.email
            }
        });

        let token: string;
        const secret = process.env.SECRET_KEY as string;
        if (!registered_user) {
            const user = await prisma.user.create({
                data: {
                    email: user_data.email,
                    user_name: user_data.name,
                    google_id: user_data.sub,
                    access_token: user_credential.access_token,
                    refresh_token: user_credential.refresh_token,
                    scope: user_credential.scope,
                    token_type: user_credential.token_type,
                    id_token: user_credential.id_token,
                    expiry_date: user_credential.expiry_date,

                }
            });
            const id = user.id;
            token = jwt.sign({ id }, secret, { expiresIn: '60h' });
            res.redirect(`http://localhost:3000/auth/${token}`)
            return;
        }
        await prisma.user.update({
            where: {
                email: registered_user.email
            },
            data: {
                google_id: user_data.sub,
                access_token: user_credential.access_token,
                refresh_token: user_credential.refresh_token,
                scope: user_credential.scope,
                token_type: user_credential.token_type,
                id_token: user_credential.id_token,
                expiry_date: user_credential.expiry_date,
            }
        });
        const id = registered_user?.id
        token = jwt.sign({ id }, secret, { expiresIn: '60h' });
        res.redirect(`http://localhost:3000/auth/${token}`)
    } catch (err) {
        console.log('Error signing up with Google')
    }
}


const getUserData = async (access_token: string) => {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    const data: TypeResponseData = await response.json();
    return data;
}

