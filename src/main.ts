import express, {Express} from 'express';
import rootRouter from './routers';
import cors from 'cors';
import app from './my_app';
import server from './my_server';

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use('/', rootRouter)

server.listen(3001, () => {
    console.log('Server started on port 3001');
});