import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}
let userRooms = {} 

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:5173", "https://securelink-ni4d.onrender.com"],
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(" User connected:", socket.id);

        socket.on("join-call", (roomId, username) => {
            console.log(" User joining room:", roomId, "Socket ID:", socket.id, "Username:", username);

            // Validate room ID
            if (!roomId || roomId.trim() === "") {
                socket.emit('room-not-found', roomId);
                return;
            }

            // Leave previous room
            if (userRooms[socket.id]) {
                const previousRoom = userRooms[socket.id];
                socket.leave(previousRoom);
                
                // Remove from previous room connections
                if (connections[previousRoom]) {
                    const index = connections[previousRoom].indexOf(socket.id);
                    if (index > -1) {
                        connections[previousRoom].splice(index, 1);
                    }
                    
                    // Clean up empty rooms after delay
                    if (connections[previousRoom].length === 0) {
                        setTimeout(() => {
                            if (connections[previousRoom] && connections[previousRoom].length === 0) {
                                console.log("🧹 Cleaning up empty room:", previousRoom);
                                delete connections[previousRoom];
                                delete messages[previousRoom];
                            }
                        }, 300000); // 5 minutes
                    }
                }
            }

            // Join new room
            socket.join(roomId);
            userRooms[socket.id] = roomId;

            // Initialize room if it doesn't exist
            if (connections[roomId] === undefined) {
                connections[roomId] = [];
            }
            if (messages[roomId] === undefined) {
                messages[roomId] = [];
            }

            // Add user to room
            connections[roomId].push(socket.id);
            timeOnline[socket.id] = new Date();

            console.log("Room", roomId, "users:", connections[roomId]);

            // Notify all users in the room about the new user (with username)
            socket.to(roomId).emit("user-joined", socket.id, username, connections[roomId], roomId);
            
            // Send existing users to the new user
            socket.emit("existing-users", connections[roomId], roomId);

            // Send previous messages to the new user
            if (messages[roomId].length > 0) {
                console.log("Sending", messages[roomId].length, "previous messages to new user");
                const recentMessages = messages[roomId].slice(-50); // Last 50 messages
                recentMessages.forEach((msg) => {
                    socket.emit("chat-message", {
                        message: msg.data,
                        sender: msg.sender,
                        timestamp: msg.timestamp,
                        roomId: roomId
                    });
                });
            }

        });

        socket.on("signal", (toId, message) => {
            console.log(" Signal from", socket.id, "to", toId);
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (messageData) => {
            console.log(" Chat message from", socket.id, ":", messageData);

            const room = userRooms[socket.id];
            
            if (!room) {
                console.log("User not in any room");
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
                socketId: socket.id,
                roomId: room
            };

            // Store message
            messages[room].push(messageObj);

            // Keep only last 100 messages to prevent memory issues
            if (messages[room].length > 100) {
                messages[room] = messages[room].slice(-100);
            }

            console.log("Stored message in room", room, "Total messages:", messages[room].length);

            // Broadcast to all users in the room
            const broadcastData = {
                message: messageData.message,
                sender: messageData.sender,
                timestamp: messageObj.timestamp,
                roomId: room
            };

            io.to(room).emit("chat-message", broadcastData);
            console.log(" Broadcasted message to room", room);
        });

        socket.on("leave-call", (roomId) => {
            console.log(" User leaving room:", roomId, "Socket:", socket.id);
            handleUserDisconnect(socket, roomId);
        });

        socket.on("disconnect", (reason) => {
            console.log(" User disconnected:", socket.id, "Reason:", reason);
            const room = userRooms[socket.id];
            handleUserDisconnect(socket, room);
        });

        socket.on("connect_error", (error) => {
            console.error(" Socket connection error:", error);
        });
    });

    return io;
};

// Helper function to handle user disconnection
const handleUserDisconnect = (socket, room) => {
    if (room && connections[room]) {
        // Remove user from connections
        const index = connections[room].indexOf(socket.id);
        if (index > -1) {
            connections[room].splice(index, 1);
        }

        console.log("User removed from room", room, "Remaining users:", connections[room]);

        // Notify other users in the room
        socket.to(room).emit("user-left", socket.id, room);

        // Clean up empty rooms after delay
        if (connections[room].length === 0) {
            setTimeout(() => {
                if (connections[room] && connections[room].length === 0) {
                    console.log(" Cleaning up empty room:", room);
                    delete connections[room];
                    delete messages[room];
                }
            }, 300000); // 5 minutes
        }
    }

    // Clean up user room tracking
    delete userRooms[socket.id];
    delete timeOnline[socket.id];
};