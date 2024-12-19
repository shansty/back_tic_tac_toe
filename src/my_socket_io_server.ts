import { Server as SocketIOServer } from "socket.io";
import {server_ws} from "./my_server";

const io = new SocketIOServer(server_ws, {
    cors: {
        origin: "http://localhost:3000", 
        credentials: true
    },
});

export default io;