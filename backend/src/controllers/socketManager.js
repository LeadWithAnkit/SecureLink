import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}
let userRooms = {} 

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-call", (path) => {
            console.log(" User joining room:", path, "Socket ID:", socket.id);

           
            if (userRooms[socket.id]) {
                socket.leave(userRooms[socket.id]);
            }

            socket.join(path);
            userRooms[socket.id] = path;

          //make new room
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            if (messages[path] === undefined) {
                messages[path] = [];
            }

          
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            console.log(" Room", path, "users:", connections[path]);

            socket.to(path).emit("user-joined", socket.id, connections[path]);

            socket.emit("existing-users", connections[path]);

            if (messages[path].length > 0) {
                console.log(" Sending", messages[path].length, "previous messages to new user");
                messages[path].forEach((msg) => {
                    socket.emit("chat-message", {
                        message: msg.data,
                        sender: msg.sender,
                        timestamp: msg.timestamp
                    });
                });
            }

        });

        socket.on("signal", (toId, message) => {
            console.log("Signal from", socket.id, "to", toId);
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (messageData) => {
            console.log(" Chat message from", socket.id, ":", messageData);

            const room = userRooms[socket.id];
            
            if (!room) {
                console.log(" User not in any room");
                return;
            }

            if (!messageData || !messageData.message || !messageData.sender) {
                console.log(" Invalid message data:", messageData);
                return;
            }

            // Create message object
            const messageObj = {
                sender: messageData.sender,
                data: messageData.message,
                timestamp: new Date().toISOString(),
                socketId: socket.id
            };

            // Store message
            messages[room].push(messageObj);

            // Keep only last 100 messages to prevent memory issues
            if (messages[room].length > 100) {
                messages[room] = messages[room].slice(-100);
            }

            console.log("Stored message in room", room, "Total messages:", messages[room].length);

            const broadcastData = {
                message: messageData.message,
                sender: messageData.sender,
                timestamp: messageObj.timestamp
            };

            io.to(room).emit("chat-message", broadcastData);
            console.log(" Broadcasted message to room", room);

        });

        socket.on("disconnect", (reason) => {
            console.log("User disconnected:", socket.id, "Reason:", reason);

            const room = userRooms[socket.id];
            
            if (room && connections[room]) {
                // Remove user from connections
                const index = connections[room].indexOf(socket.id);
                if (index > -1) {
                    connections[room].splice(index, 1);
                }

                console.log("User removed from room", room, "Remaining users:", connections[room]);

                // Notify other users in the room
                socket.to(room).emit("user-left", socket.id);

                // Clean up empty rooms
                if (connections[room].length === 0) {
                    console.log(" Cleaning up empty room:", room);
                    delete connections[room];

                }
            }

            // Clean up user room tracking
            delete userRooms[socket.id];
            delete timeOnline[socket.id];

        });

        // Handle connection errors
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

    });

    return io;
};