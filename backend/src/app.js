import express from "express";
import {createServer} from "node:http";
import dotenv from "dotenv";
dotenv.config();
import {Server} from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
//import routes
import userRoutes from "./routes/user.routes.js";

 const app=express();
 const PORT = process.env.PORT || 3000;
 //server ke liye
 const server= createServer(app);
 const io= connectToSocket(server);

console.log("PORT:", process.env.PORT); 
 app.use(cors());
 app.use(express.json({limit:"40kb"}));
 app.use(express.urlencoded({limit:"40kb", extended:true}));

 //ROUTES 
 app.use("/api/v1/users",userRoutes);


const start = async () => {
    const connectionDb = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongo connected db host: ${connectionDb.connection.host}`)
    server.listen(PORT, () => {
          console.log(`🚀 Server listening on port ${PORT}`);
        });
}

start(); 