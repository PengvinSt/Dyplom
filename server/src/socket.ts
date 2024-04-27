import { Server, Socket } from "socket.io"
import { IChat } from "../interfaces/chat"
import { IMessage } from "../interfaces/message"
import Chat from '../models/chat.schema';

export default class SocketConnect {
    constructor(private io:Server) {}

    activeUsers:{roomId:string, users:{uId:string}[]}[] = []

    activeChats: {roomId:string, timeoutId:NodeJS.Timeout}[] = []

    startUp() {
        this.io.on("connect", async(socket) => {
            const uId:string = String(socket.handshake.headers.userid)
            const roomId:string = String(socket.handshake.headers.id)
            const room = await Chat.findOne({ roomId: roomId })
            socket.join(uId)
            socket.emit("Connected")

            if(!this.activeUsers.some(chat => chat.roomId === roomId)){
                this.activeUsers.push({
                    roomId,
                    users:[{ uId }]
                });
            }

            const currentRoom = this.activeUsers.filter(chat => chat.roomId === roomId)[0];

            if (!currentRoom.users.some((user) => user.uId === uId)) {
                currentRoom.users.push({ uId });
                const newActiveUsers = this.activeUsers.map(chat => chat.roomId !== roomId ? chat : currentRoom);
                this.activeUsers = newActiveUsers;
                console.log("New User Connected", this.activeUsers);
            } 

            if(room?.roomAdmId === uId){
                const timeoutId = setTimeout(()=>{
                    this.innactiveChatTimeout(socket, roomId, uId)
                }, 20000)
    
                this.activeChats.push({roomId, timeoutId})
            }

            socket.on("connect_error", (err) => {
                console.log(err.message);
                console.log(err.description);
                console.log(err.context);
              });

            socket.on('disconnect', async () => {
                let currentRoom = this.activeUsers.filter(chat => chat.roomId === roomId)[0];
                if (room?.roomAdmId === uId) {
                    await Chat.deleteOne({ roomId: roomId });
                    currentRoom.users.map((user) =>{
                        if(user.uId === uId) return;
                        socket.in(user.uId).emit('admin left close room')
                    })
                    const currentTimeOutId = this.activeChats.filter(ch => ch.roomId === roomId)[0];
                    const newActiveChats = this.activeChats.filter(ch => ch.roomId !== roomId);
                    if(currentTimeOutId.timeoutId !== undefined) clearTimeout(currentTimeOutId.timeoutId);
                    this.activeChats = newActiveChats;
                    // ??? REDO
                    currentRoom.users.filter((user) => user.uId !== uId);
                    if(currentRoom.users.length < 0) {
                        const newActiveUsers = this.activeUsers.filter(chat => chat.roomId !== roomId)
                        this.activeUsers = newActiveUsers;
                    }else {
                        const newActiveUsers = this.activeUsers.map(chat => chat.roomId !== roomId ? chat : currentRoom);
                        this.activeUsers = newActiveUsers;
                    }
                    console.log("Admin Disconnected, chat deleted", roomId);

                }else {
                    await Chat.updateOne(
                        { roomId: roomId },
                        { $pull: { users: { uId: uId.toString() } } }
                    );       
                    currentRoom.users.filter((user) => user.uId !== uId);
                    if(currentRoom.users.length < 0) {
                        const newActiveUsers = this.activeUsers.filter(chat => chat.roomId !== roomId)
                        this.activeUsers = newActiveUsers;
                    }else {
                        const newActiveUsers = this.activeUsers.map(chat => chat.roomId !== roomId ? chat : currentRoom);
                        this.activeUsers = newActiveUsers;
                    }
                    console.log("User Disconnected", this.activeUsers);
                }
                
            });
        })

        this.io.on('connection', (socket) => {
            socket.on('chat message', async (req) => {
                let data:IMessage = req

                let chat:IChat | null = await Chat.findOne({ roomId:data.roomId })
                
                if(chat !== null){
                    chat.users.forEach(user =>
                        {
                            if(user.uId === data.senderId) return
                            const res:{ uId: string; msg: string } = {
                                msg:data.message,
                                uId:data.senderId,
                            }
                            socket.in(user.uId).emit("chat message send",res)
                        }
                    )
                    const currentTimeOutId = this.activeChats.filter(ch => ch.roomId === data.roomId)[0];
                    clearTimeout(currentTimeOutId.timeoutId);
                    const timeoutId = setTimeout(()=>{
                        this.innactiveChatTimeout(socket, data.roomId, data.senderId)
                    }, 20000)
                    
                    this.activeChats.map(ch => {
                        if(ch.roomId === data.roomId){
                            ch.timeoutId = timeoutId;
                        }
                    })
                } 
            });

            socket.on('check permission', async (data)=> {
                const roomId:string = String(socket.handshake.headers.id)
                const room = await Chat.findOne({ roomId: roomId })
                if (room && room.roomAdmId && room.roomAdmId !== data.uId) {
                    socket.in(room.roomAdmId).emit("check permission admin", { uId:data.uId })
                }
            })

            socket.on('check permission answer', (data:{uId:string, answer:string})=>{
                if(data.answer === "NOK"){
                    socket.in(data.uId).emit("check permision deny")
                }
                socket.in(data.uId).emit("check permision accept")
            })
        });
    }

    async innactiveChatTimeout(socket:Socket, roomId:string, uId:string) {
        const room = await Chat.findOne({ roomId: roomId }).lean();
        let currentRoom = this.activeUsers.filter(chat => chat.roomId === roomId)[0];
        const adminId = room?.roomAdmId 

        console.log(socket.rooms)
        if (adminId && adminId === uId) {  
            socket.emit('chat message admin', {uId: adminId});
        } else {
            currentRoom.users.map((user) =>{
                socket.in(user.uId).emit('chat message admin', {uId: adminId});
            })
        } 
        console.log("Innactive, delete chat", room?.roomId + '||' + roomId); 
    }
}