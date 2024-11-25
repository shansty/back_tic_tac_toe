import express from 'express';
import rootRouter from './routers';
import cors from 'cors';
import { app_api } from './my_app';
import { server_api, server_ws } from './my_server';
import { PrismaClient } from '@prisma/client'
import('./sockets/game');
import('./sockets/main');
import('./sockets/game_chat');

const prisma = new PrismaClient()

app_api.use(express.json());
app_api.use(cors({ origin: "http://localhost:3000", credentials: true }));
app_api.use('/', rootRouter)

export async function main() {
    await prisma.user.create({
      data: {
        name: 'One more test',
        email: 'ale@pri.io',
        posts: {
          create: { title: 'World' },
        },
        profile: {
          create: { bio: 'ke turtles' },
        },
      },
    })
  
    const allUsers = await prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    })
    console.dir(allUsers, { depth: null })
  }

    main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

server_api.listen(3001, () => {
    console.log('Server api started on port 3001');
});

server_ws.listen(3002, () => {
    console.log('Server ws started on port 3002')
})