import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from "socket.io";
import { createServer } from "http";
import SocketConnect from "./socket";
import { IChat } from "../interfaces/chat";
import DBConnection from "../utils/db.conn";
import Chat from '../models/chat.schema';


dotenv.config()

const app:Express = express()
const PORT = process.env.PORT || 3001

const rooms:IChat[] = [];

app.use(cors(
    {
    credentials:true,
    origin: process.env.CLIENT_URL
    }
 ))
app.use(express.json());


app.post('/api/create_room', async (req:Request, res:Response) => {
    const data:IChat = req.body;
    await Chat.create(data);
    res.status(200).json({ status: 'OK'})
})

app.post('/api/get_room', async(req:Request, res:Response) => {
    const data:{ roomId: string, uId:string} = req.body;
    const room = await Chat.findOne({ roomId: data.roomId})


    if(!room) return res.status(200).json({ status: 'NOK'})

    let candidate = room?.users.filter((user: any) => user.uId === data.uId); 

    console.log(candidate)
    

    if(!candidate || candidate.length < 1) {
        const updatedRoom = await room?.updateOne(
            { $addToSet: { users: { uId: data.uId } } },
            { new: true }
        );
        if (updatedRoom) {
            return res.status(200).json({ status: 'OK' });
        } else {
            return res.status(500).json({ status: 'Error updating room' });
        }
    }
        
   res.status(200).json({ status: 'OK'})
})

const start = async () => {
    try {
        const server = app.listen(PORT, ()=> console.log(`listening on port ${PORT}`))
        await DBConnection.MongoDBConnection()
        const io:Server = new Server(server,{
            pingTimeout:60000,
            cors: {
                origin: process.env.CLIENT_URL,
              },
        });
        const io_controller = new SocketConnect(io)
        io_controller.startUp()


    } catch (error) {
        console.log(error)
    }
}

start()