import { Socket } from "socket.io"
import { RoomManager } from "./RoomManager";

export interface User{
    name:string,
    socket:Socket,
}

export class UserManager {
     private users: User[];
     private queue: string[];
     private roomManager: RoomManager;

    constructor(){
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name:string , socket:Socket){
        this.users.push({
            name,
            socket
        });

        console.log("added user to queue");

        this.queue.push(socket.id);
        this.clearQueue();
        this.initEventListners(socket);
        
    }

    clearQueue(){
        if(this.queue.length < 2){
            console.log("not able to remove from queue" );
            return ;
        }
        console.log("able to remove pair from queue" , this.queue.length);
        const user1Id = this.queue.pop();
        const user2Id = this.queue.pop();
    
        console.log("clear queue !!" , user1Id , user2Id);

        const user1  = this.users.find(u=> u.socket.id === user1Id);
        const user2  = this.users.find(u=> u.socket.id === user2Id);
        
        if(!user1 || !user2){
            return;
        }

        this.roomManager.createRoom(user1 , user2);
        this.clearQueue();
    }
    
    removeUser(socketId:string){
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }



    initEventListners(socket:Socket){
        
        socket.on('offer' , ({sdp , roomId}:{sdp: string, roomId: string})=>{
            console.log("hi from offer call");
            this.roomManager.onOffer(sdp , roomId , socket.id)
        });
        socket.on('answer' , ({sdp , roomId}:{sdp: string, roomId: string})=>{
            this.roomManager.onAnswer(sdp , roomId , socket.id)
        });
        socket.on('added-icecandidate' , ({candidate , roomId , type})=>{
            this.roomManager.onIceCandidates(candidate , roomId , socket.id , type )
        });
    }



}