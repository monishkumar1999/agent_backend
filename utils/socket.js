const Message = require("../model/Message");

const initializeSocket = (server) => {
    const socket = require("socket.io");

    // Configure socket.io with CORS settings
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:3000", "http://192.168.29.5:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("⚡ New client connected:", socket.id);

        socket.on("joinChat", ({ userId, targetId }) => {
            try {
                const roomId = [userId, targetId].sort().join("_"); // Create a unique room ID
                console.log(`🔹 User ${userId} joining room: ${roomId}`);

                socket.join(roomId);
                socket.emit("joinSuccess", roomId);
            } catch (error) {
                console.error("❌ Join room error:", error);
                socket.emit("joinError", error.message);
            }
        });

        socket.on("sendMessage", async ({ userId, targetId, message }) => {
            try {
                const roomId = [userId, targetId].sort().join("_");

                // Save message to database
                const newMessage = new Message({
                    participate: [userId, targetId],
                    sender: userId,
                    message: message,
                });

                await newMessage.save();

                // Emit the message to the room
                io.to(roomId).emit("messageReceived", {
                    sender: userId,
                    message: message,
                    timestamp: new Date().toISOString(),
                });

                console.log(`📩 Message sent in room ${roomId} by ${userId}: ${message}`);
            } catch (error) {
                console.error("❌ Error sending message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });
};

module.exports = initializeSocket;
