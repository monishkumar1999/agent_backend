const initializeSocket = (server) => {
    const socket = require('socket.io');

    // Configure socket.io with CORS settings
    const io = socket(server, {
        cors: {
            origin: 'http://localhost:3000', // Replace with your React app's URL
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP method
            credentials: true, // Allow cookies and credentials
        },
    });

    io.on('connection', (socket) => {

        socket.on('joinChat', ({ userId, targetId }) => {   //on like get request  // emit is send response
            try {
                const roomId = [userId, targetId].sort().join("_"); // Create a unique room ID
                console.log(`Joining room: ${roomId}`);
                
                socket.join(roomId);
                socket.emit('joinSuccess', roomId);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('joinError', error.message);
            }
        });
        

        socket.on('sendMessage', ({ userId, targetId, message }) => {

            const roomId = [userId, targetId].sort().join("_");
         
            io.to(roomId).emit("messageReceived", { message })  // send  data to room id

        });

        socket.on('disconnect', () => {

        });
    });
};

module.exports = initializeSocket;
