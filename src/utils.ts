import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";


export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


const scrypt: (password: string | Buffer, salt: string | Buffer, keylen: number) => Promise<Buffer> = promisify(scryptCallback);

export const scryptHash = async (string: string, salt?: string): Promise<string> => {
    const saltInUse = salt || randomBytes(16).toString("hex");
    const hashBuffer = await scrypt(string, saltInUse, 32);

    return `${hashBuffer.toString("hex")}:${saltInUse}`;
};

export const scryptVerify = async (string: string, hashAndSalt: string): Promise<boolean> => {
    const [hash, salt] = hashAndSalt.split(":");
    const newHashAndSalt = await scryptHash(string, salt);

    return newHashAndSalt === hashAndSalt;
};
