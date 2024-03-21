"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const UserManager_1 = require("./managers/UserManager");
const server = http_1.default.createServer(http_1.default);
const PORT = 3000;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    }
});
const userManager = new UserManager_1.UserManager();
io.on('connection', (socket) => {
    console.log("connection made !!");
    userManager.addUser("jaikumar", socket);
    socket.on('disconnect', () => {
        console.log('user disconnected !!');
        userManager.removeUser(socket.id);
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
