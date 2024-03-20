import { Server } from "socket.io";
import http from 'http'
import { UserManager } from "./managers/UserManager";
const server = http.createServer(http);
const PORT = 3000;
const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

const userManager = new UserManager();

io.on('connection', (socket) => {
    console.log("connection made !!");
    userManager.addUser("jaikumar", socket);
    socket.on('disconnect', () => {
        console.log('user disconnected !!');
        userManager.removeUser(socket.id);
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});