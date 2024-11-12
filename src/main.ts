import express, {Express} from 'express';
import rootRouter from './routers';
import cors from 'cors';
import { Server } from "socket.io";
import { createServer } from 'node:http';
import { generateRandomString } from './utils';

let user_ids: string[] = [];

const app:Express = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
  },
});


app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use('/', rootRouter)


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on("Waiting for game connection", () => {

    let user_id = socket.id;
    let isUserAlreadyInList = user_ids.find(id => id == user_id);
    console.log(`isUserAlreadyInList  ${isUserAlreadyInList}`)

    if(isUserAlreadyInList  == undefined) {

      console.log(`user_ids befor all  ${user_ids}`)
      user_ids.push(user_id);
      console.log(`user_ids after push  ${user_ids}`)

      if(user_ids.length>=2) {
        console.log('Go into if lenght >=2')
        const roomName = generateRandomString(5);

        const players = user_ids.slice(0, 2)

        console.log(`players ${players}`)

        players.forEach(playerId => {
          const playerSocket = io.of("/").sockets.get(playerId); 
          console.log(`playerSocket ${playerSocket}`)
          if (playerSocket) {
            playerSocket.join(roomName);
          }
        });

        io.to(roomName).emit('roomCreated', `You have been paired in ${roomName}`);
        io.to(roomName).emit('startGame');

        user_ids.splice(0, 2);
        console.log(`user_ids after all  ${user_ids}`)
      }
    }
    else {
      socket.emit("Waiting for game partner")
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    user_ids = user_ids.filter(user_id => user_id !== socket.id);
  });
});

server.listen(3001, () => {
    console.log('Server started on port 3001');
});