import mongoose from "mongoose"

export default class DBConnection {
    public static async MongoDBConnection(){
        try {
            const credentials = process.env.MONGO_URL || "mongodb://localhost:8080";
            const conn = await mongoose.connect(credentials)
            console.log(`MongoDB connection on ${conn.connection.host}`)
        } catch (error:any) {
            console.log(`Error: ${error.message}`)
            process.exit()
        }
    }
}