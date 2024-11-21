import express from 'express';
import rootRouter from './routers';
import cors from 'cors';
import { app_api } from './my_app';
import { server_api, server_ws } from './my_server';
import('./sockets/game');
import('./sockets/main');
import('./sockets/game_chat');

app_api.use(express.json());
app_api.use(cors({ origin: "http://localhost:3000", credentials: true }));
app_api.use('/', rootRouter)

server_api.listen(3001, () => {
    console.log('Server api started on port 3001');
});

server_ws.listen(3002, () => {
    console.log('Server ws started on port 3002')
})