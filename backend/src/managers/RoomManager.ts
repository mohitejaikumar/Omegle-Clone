import { User } from "./UserManager";

let GENERATE_ROOM = 1;

interface Room {
    user1: User;
    user2: User;
}

export class RoomManager {
    private rooms: Map<string, Room>

    constructor() {
        this.rooms = new Map<string, Room>()
    }

    createRoom(user1: User, user2: User) {
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
        })
    }

    onOffer(sdp: string, roomId: string, socketId: string) {
        const room = this.rooms.get(roomId);
        console.log("calling onOffer", roomId, room, this.rooms)
        if (!room) {
            return;
        }
        console.log("send offer to receiverSide ", roomId);
        const receivingSocket = room.user1.socket.id === socketId ? room.user2.socket : room.user1.socket;
        receivingSocket.emit('offer', {
            sdp,
            roomId
        })

    }

    onAnswer(sdp: string, roomId: string, socketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        console.log("send answer to senderSide ", roomId);
        const receivingSocket = room.user1.socket.id === socketId ? room.user2.socket : room.user1.socket;
        receivingSocket.emit('answer', {
            sdp,
            roomId
        })
    }
    onIceCandidates(candidate: string, roomId: string, socketId: string, type: 'sender' | 'receiver') {
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
        })
    }

    generateRoomId() {
        return GENERATE_ROOM++;
    }
}





