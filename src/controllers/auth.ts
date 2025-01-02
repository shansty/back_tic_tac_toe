import { Request, Response } from 'express';
import { scryptHash, scryptVerify } from '../utils';
import * as jwt from "jsonwebtoken";
import prisma from '../prisma-client';


export const sighUp = async (req: Request, res: Response) => {

  const { email, password, username }: { email: string, password: string, username: string } = req.body;
  const hashPassword = await scryptHash(password);

  if (email === "" || password === "" || username === "") {
    res.status(401).json({ message: 'Invalid data: some fields is empty' });
  }

  let user = await prisma.user.findFirst({
    where: {
      email: email,
      user_name: username
    }
  });

  if (user) {
    res.status(409).json({ message: 'User with this email or username already exist' });
  } else {
    user = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
        user_name: username
      }
    })
    res.status(200).json(user)
  }
}


export const signIn = async (req: Request, res: Response) => {
  const { username, password }: { username: string, password: string } = req.body;

  if (username === "" || password === "") {
    res.status(401).json({ message: 'Username or password is empty' });
  }

  let user = await prisma.user.findFirst({
    where: {
      user_name: username,
    },
  });

  if (user) {
    const hashPassword = user.password as string;
    const isValid = await scryptVerify(password, hashPassword)
    console.dir({ isValid })
    if (!isValid) {
      res.status(404).json({ message: "Invalid password" })
    }
    let id = user.id;
    const secret = process.env.SECRET_KEY as string;
    let token = jwt.sign({ id }, secret, { expiresIn: '60h' });
    res.status(200).json({ token });

  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
}
