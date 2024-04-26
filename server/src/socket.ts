import { Server } from "socket.io"
import { IChat } from "../interfaces/chat"
import { IMessage } from "../interfaces/message"
import Chat from '../models/chat.schema';

export default class SocketConnect {
    constructor(private io:Server) {}

    activeUsers:{uId:string}[] = []

    startUp() {
        this.io.on("connect", async(socket) => {
            const uId:string = String(socket.handshake.headers.userid)
            const roomId:string = String(socket.handshake.headers.id)
            const room = await Chat.findOne({ roomId: roomId })
            socket.join(uId)
            socket.emit("Connected")
            if (!this.activeUsers.some((user) => user.uId === uId)) {
                this.activeUsers.push({ uId });
                console.log("New User Connected", this.activeUsers);
            } 

            socket.on("connect_error", (err) => {
                console.log(err.message);
                console.log(err.description);
                console.log(err.context);
              });

            socket.on('disconnect', async () => {
                console.log({
                    roomId: roomId,
                    uId: uId,
                })
                if (room?.roomAdmId === uId) {
                    await Chat.deleteOne({ roomId: roomId });
                    this.activeUsers.map((user) =>{
                        if(user.uId === uId) return;
                        socket.in(user.uId).emit('admin left close room')
                    })
                    console.log("Admin Disconnected, chat deleted");
                }else {
                    await Chat.updateOne(
                        { roomId: roomId },
                        { $pull: { users: { uId: uId.toString() } } }
                    );

                    this.activeUsers = this.activeUsers.filter((user) => user.uId !== uId);
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
}