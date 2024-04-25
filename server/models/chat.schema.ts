import { Schema, model } from "mongoose"

const chatSchema = new Schema({
    roomId: { type: String },
    roomAdmId: { type: String },
    users: [{
        uId: {type: String}
    }]
},{
    timestamps:true,
})

const Chat = model("Chats", chatSchema)

export default Chat;