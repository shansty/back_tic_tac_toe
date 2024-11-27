import { Request, Response } from 'express';
import { users } from '../datas/users';
import { secretKey } from '../datas/secret';
import * as jwt from "jsonwebtoken";
import { TypeUser } from '../types';
import prisma from '../prisma-client';


export const sighUp = async (req: Request, res: Response) => {

    const {email, password}: {email:string, password:string} = req.body;
    if(email== undefined || password == undefined) {
      res.status(401).json({ message: 'Invalid username or password' });
    }

    // let user = users.find(el => {
    //     return el.email === email;
    //   })

    let user = await prisma.user.findFirst({where: {email}});
    console.log(user)

    if(user) {
        res.status(409).json({message: 'User with this email already exist'});    
    }  else {
        user = await prisma.user.create({
          data: {
              email,
              password
          }
      })
      res.json(user)
    //     const id = users.length;
    //     const newUser: TypeUser = {
    //     id: id,
    //     email: email,
    //     password: password
    // }
    
    // users.push(newUser);
    // res.status(200).json({message: `${email}, You are registered!`})
    }
}

export const signIn =  (req: Request, res: Response) => { 
    const {email, password}: {email:string, password:string} = req.body;
    if(email== undefined || password == undefined) {
      res.status(401).json({ message: 'Invalid username or password' });
    }

    let user = users.find(el => {
        return el.email === email && el.password == password;
      })

    if (user) {
        let id = user.id;
        let token = jwt.sign( {id}, secretKey, { expiresIn: '60h' });
        res.status(200).json({ token });
    
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
}
