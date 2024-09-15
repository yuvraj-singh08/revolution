import { io } from "../server";

export const socketCallback = async (socket) => {
    try {
      const userType = socket.handshake.query["userType"];
      const token = socket.handshake.query["token"];
      const { user_id } = decodeToken(token);
      const socketId = socket.id;
      await saveSocketId({ userType, id: user_id, socketId });
      console.log(`User connected with address: ${socket.id}`);
  
      io.emit('message', 'Welcome to the chat!');
  
      socket.on('message', (msg) => {
        console.log(`Message received: ${msg}`);
        io.emit('message', msg); // Broadcast the message to all clients
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
  
      socket.on('sendNotification', async (data) => {
        const { to, from, title, message } = data;
  
        // Perform any additional logic like saving to the database here
        const idList = await getSocketId({ id: to })
        // Emit the notification to the intended recipient
        io.to(idList).emit('receiveNotification', { from, title, message });
        await saveNotification({ sender: from ,userId: to, title, message });
        // await saveNotification({ sender: user_id ,userId: to, title, message });
  
        console.log(`Notification sent from ${from} to ${idList}: ${message}`);
      })
  
    } catch (error) {
      console.error('Error saving socket ID:', error);
      socket.disconnect(true); // Disconnect the socket if an error occurs
    }
  }