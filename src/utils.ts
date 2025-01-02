import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";


const scrypt: (password: string | Buffer, salt: string | Buffer, keylen: number) => Promise<Buffer> = promisify(scryptCallback);


export const scryptHash = async (string: string, salt?: string): Promise<string> => {
    const saltLocal = process.env.SALT as string;
    const localHash = await scrypt(string, saltLocal, 32);
    const saltInUse = salt || randomBytes(16).toString("hex");
    const resultBuffer = await scrypt(localHash, saltInUse, 32);

    return `${resultBuffer.toString("hex")}:${saltInUse}`;
};


export const scryptVerify = async (string: string, hashAndSalt: string): Promise<boolean> => {
    const [hash, salt] = hashAndSalt.split(":");
    const resultHashAndSalt = await scryptHash(string, salt);
    console.log(`resultHashAndSalt ${resultHashAndSalt}`)

    return resultHashAndSalt === hashAndSalt;
};



