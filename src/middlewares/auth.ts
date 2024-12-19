import { NextFunction, Request, Response } from "express";
import { IJwtPayloadWithId } from "../interfaces";
import prisma from "../prisma-client";
import * as jwt from "jsonwebtoken";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

  const secret = process.env.SECRET_KEY;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  try {
    const decoded = jwt.verify(token, secret as string) as IJwtPayloadWithId;
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }
    const user = await prisma.user.findFirst({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;