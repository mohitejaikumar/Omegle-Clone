"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GENERATE_ROOM = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generateRoomId().toString();
        this.rooms.set(roomId, {
            user1,
            user2
        });
        console.log("Created Room for ");
        user1.socket.emit('call-initiated', {
            roomId
        });
        user2.socket.emit('call-initiated', {
            roomId
        });
    }
    onOffer(sdp, roomId, socketId) {
        const room = this.rooms.get(roomId);
        console.log("calling onOffer", roomId, room, this.rooms);
        if (!room) {
            return;
        }
        console.log("send offer to receiverSide ", roomId);
        const receivingSocket = room.user1.socket.id === socketId ? room.user2.socket : room.user1.socket;
        receivingSocket.emit('offer', {
            sdp,
            roomId
        });
    }
    onAnswer(sdp, roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        console.log("send answer to senderSide ", roomId);
        const receivingSocket = room.user1.socket.id === socketId ? room.user2.socket : room.user1.socket;
        receivingSocket.emit('answer', {
            sdp,
            roomId
        });
    }
    onIceCandidates(candidate, roomId, socketId, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        console.log("send iceCandidates  ", roomId);
        const receivingSocket = room.user1.socket.id === socketId ? room.user2.socket : room.user1.socket;
        receivingSocket.emit('added-icecandidate', {
            candidate,
            roomId,
            type
        });
    }
    generateRoomId() {
        return GENERATE_ROOM++;
    }
}
exports.RoomManager = RoomManager;
