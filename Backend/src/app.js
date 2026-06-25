import express from "express";
import {createServer} from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";

import cors from "cors";
import connectToSocket from "./controllers/socketManager.js";

import userRoutes from "./routes/users.routes.js";

 const app = express();
 const server=createServer(app);
 const io = connectToSocket(server);

app.set("port",(process.env.PORT || 8000))
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb",extended: true}));

app.use("/api/v1/users",userRoutes);


 const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb://127.0.0.1:27017/meeting_app");
        
        console.log(`MONGO connected DB host: ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });
    } catch (error) {
        console.error("ERROR CONNECTING TO DATABASE:", error);
        process.exit(1); // Stop the app if the DB fails
    }
}


 start();