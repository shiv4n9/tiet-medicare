import Message from '../models/Message.js';

// Store active users
const activeUsers = new Map();

export const initializeChat = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('user:join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined`);

      // Broadcast online status
      io.emit('user:online', userId);
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        console.log('Received message:send event:', data);
        
        const { conversationId, receiverId, receiverName, message, messageType, senderId, senderName, senderRole } = data;

        if (!conversationId || !message || !senderName) {
          console.error('Missing required fields:', { conversationId, message, senderName });
          socket.emit('message:error', { error: 'Missing required fields' });
          return;
        }

        // Use senderId from data if socket.userId is not set
        const actualSenderId = socket.userId || senderId || 'unknown';

        // Save to database
        const newMessage = new Message({
          conversationId,
          senderId: actualSenderId,
          senderName: senderName,
          senderRole: senderRole || 'patient',
          receiverId: receiverId || 'unknown',
          receiverName: receiverName || 'Unknown',
          message,
          messageType: messageType || 'text'
        });

        await newMessage.save();
        console.log('Message saved to database:', newMessage._id);

        // Emit to conversation room
        io.to(conversationId).emit('message:receive', newMessage);
        console.log('Message emitted to room:', conversationId);

        // Also emit back to sender
        socket.emit('message:receive', newMessage);

        // Notify receiver if online
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification:new-message', {
            conversationId,
            senderName,
            message
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      socket.to(data.conversationId).emit('typing:user', {
        userId: socket.userId,
        userName: data.userName
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.conversationId).emit('typing:stop', {
        userId: socket.userId
      });
    });

    // Video call events
    socket.on('call:initiate', (data) => {
      const { receiverId, roomId, callerName } = data;
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call:incoming', {
          roomId,
          callerId: socket.userId,
          callerName
        });
      }
    });

    socket.on('call:accept', (data) => {
      const { callerId, roomId } = data;
      const callerSocketId = activeUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:accepted', { roomId });
      }
    });

    socket.on('call:reject', (data) => {
      const { callerId } = data;
      const callerSocketId = activeUsers.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected');
      }
    });

    socket.on('call:end', (data) => {
      const { conversationId } = data;
      io.to(conversationId).emit('call:ended');
    });

    // Clinical data updates (for real-time patient dashboard sync)
    socket.on('clinical:prescription-created', (data) => {
      const { patientId, prescription } = data;
      const patientSocketId = activeUsers.get(patientId);
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('dashboard:prescription-update', prescription);
      }
      
      console.log(`Prescription created notification sent to patient ${patientId}`);
    });

    socket.on('clinical:lab-order-created', (data) => {
      const { patientId, labOrder } = data;
      const patientSocketId = activeUsers.get(patientId);
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('dashboard:lab-order-update', labOrder);
      }
      
      console.log(`Lab order created notification sent to patient ${patientId}`);
    });

    socket.on('clinical:referral-created', (data) => {
      const { patientId, referral } = data;
      const patientSocketId = activeUsers.get(patientId);
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('dashboard:referral-update', referral);
      }
      
      console.log(`Referral created notification sent to patient ${patientId}`);
    });

    socket.on('clinical:medical-record-created', (data) => {
      const { patientId, medicalRecord } = data;
      const patientSocketId = activeUsers.get(patientId);
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('dashboard:medical-record-update', medicalRecord);
      }
      
      console.log(`Medical record created notification sent to patient ${patientId}`);
    });

    // Consultation completed - triggers medical record creation
    socket.on('consultation:completed', (data) => {
      const { patientId, appointmentId } = data;
      const patientSocketId = activeUsers.get(patientId);
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('dashboard:consultation-completed', {
          appointmentId,
          message: 'Your consultation has been completed. Medical records have been updated.'
        });
      }
      
      console.log(`Consultation completed notification sent to patient ${patientId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        io.emit('user:offline', socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

export default initializeChat;
