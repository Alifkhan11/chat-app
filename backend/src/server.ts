import express, { Request, Response, RequestHandler } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import { Message } from './models/Message'
import { User } from './models/User'
import * as authController from './controllers/authController'
import * as messageController from './controllers/messageController'
import jwt from 'jsonwebtoken'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  connectTimeout: 10000,
  maxHttpBufferSize: 1e6 // 1 MB
})

// Store connected users
const users: { [key: string]: string } = {}

// Middleware to handle authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Update user's online status and socket ID
    user.isOnline = true;
    user.socketId = socket.id;
    user.lastSeen = new Date();
    await user.save();

    socket.data.user = user;
    users[socket.id] = user._id.toString();
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// MongoDB Connection
mongoose.connect('mongodb+srv://admine:admine@cluster0.m6hhp6r.mongodb.net/chat_app?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error))

app.use(cors())
app.use(express.json())

// Authentication Routes
app.post('/api/auth/register', authController.register as RequestHandler)
app.post('/api/auth/login', authController.login as RequestHandler)
app.get('/api/users', authController.getUsers as RequestHandler)

// Message Routes
app.get('/api/conversations/:userId', messageController.getUserConversations as RequestHandler)
app.get('/api/messages/:userId/:otherUserId', messageController.getConversation as RequestHandler)
app.post('/api/messages', messageController.sendMessage as RequestHandler)
app.put('/api/messages/read/:userId/:otherUserId', messageController.markConversationAsRead as RequestHandler)

io.on('connection', async (socket) => {
  console.log('A user connected');
  
  try {
    const user = socket.data.user;
    
    // Send initial user list to the connected user
    const allUsers = await User.find({ _id: { $ne: user._id } })
      .select('username fullName profilePicture isOnline lastSeen _id');
    socket.emit('user_list', allUsers);

    // Broadcast to all clients that this user is online
    socket.broadcast.emit('user_status', {
      userId: user._id,
      isOnline: true,
      lastSeen: new Date()
    });

    // Handle get users request
    socket.on('get_users', async () => {
      const users = await User.find({ _id: { $ne: user._id } })
        .select('username fullName profilePicture isOnline lastSeen _id');
      socket.emit('user_list', users);
    });

    // Handle joining a conversation
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      try {
        // Leave all previous rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join new conversation room
        socket.join(data.conversationId);
        console.log(`User ${user._id} joined conversation: ${data.conversationId}`);

        // Fetch and send previous messages
        const messages = await Message.find({ conversationId: data.conversationId })
          .sort({ createdAt: 1 })
          .populate('sender', 'username fullName profilePicture')
          .populate('recipient', 'username fullName profilePicture');
        
        socket.emit('previous_messages', messages);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle private messages
    socket.on('private_message', async (data: { recipientId: string, text: string, conversationId: string }) => {
      try {
        const message = await Message.create({
          sender: user._id,
          recipient: data.recipientId,
          text: data.text,
          conversationId: data.conversationId,
          createdAt: new Date()
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username fullName profilePicture')
          .populate('recipient', 'username fullName profilePicture');

        // Emit to all users in the conversation
        io.to(data.conversationId).emit('new_message', populatedMessage);

        // Update conversations for both users
        await Promise.all([
          messageController.updateUserConversation(user._id.toString(), data.recipientId, message._id),
          messageController.updateUserConversation(data.recipientId, user._id.toString(), message._id)
        ]);

        socket.emit('message_sent', { success: true, message: populatedMessage });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        // Update user status
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();

        // Broadcast offline status
        io.emit('user_status', {
          userId: user._id,
          isOnline: false,
          lastSeen: user.lastSeen
        });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  } catch (error) {
    console.error('Error in socket connection:', error);
    socket.disconnect();
  }
});

// API Routes
app.get('/messages', async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ private: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' })
  }
})

app.get('/users/online', async (req: Request, res: Response) => {
  try {
    const onlineUsers = await User.find({ isOnline: true })
      .select('username lastSeen')
      .lean()
    res.json(onlineUsers)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching online users' })
  }
})

app.get('/', (req: Request, res: Response) => {
  res.send('Chat Server Running')
})

const port = 5000
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})