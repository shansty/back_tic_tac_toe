import { Server as SocketIOServer } from "socket.io";
import server from "./my_server";

const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000", 
    },
});

export default io;