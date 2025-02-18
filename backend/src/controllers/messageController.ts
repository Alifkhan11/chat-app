import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params;
    const conversationId = [userId, otherUserId].sort().join('-');

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username fullName profilePicture')
      .populate('recipient', 'username fullName profilePicture');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conversation' });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: 'conversations.with',
        select: 'username fullName profilePicture isOnline lastSeen'
      })
      .populate('conversations.lastMessage');

    res.json(user?.conversations || []);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching conversations' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, text } = req.body;
    const conversationId = [senderId, recipientId].sort().join('-');

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text,
      conversationId,
    });

    // Update or create conversation for both users
    await Promise.all([
      updateUserConversation(senderId, recipientId, message._id),
      updateUserConversation(recipientId, senderId, message._id),
    ]);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username fullName profilePicture')
      .populate('recipient', 'username fullName profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
};

export const updateUserConversation = async (userId: string, otherUserId: string, messageId: mongoose.Types.ObjectId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const conversationIndex = user.conversations.findIndex(
    conv => conv.with?.toString() === otherUserId
  );

  if (conversationIndex > -1) {
    // Update existing conversation
    user.conversations[conversationIndex].lastMessage = messageId;
    if (userId !== otherUserId) { // Don't increment unread for self-messages
      user.conversations[conversationIndex].unreadCount += 1;
    }
  } else {
    // Create new conversation
    user.conversations.push({
      with: new mongoose.Types.ObjectId(otherUserId),
      lastMessage: messageId,
      unreadCount: userId === otherUserId ? 0 : 1,
    });
  }

  await user.save();
};

export const markConversationAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversationIndex = user.conversations.findIndex(
      conv => conv.with?.toString() === otherUserId
    );

    if (conversationIndex > -1) {
      user.conversations[conversationIndex].unreadCount = 0;
      await user.save();
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversationId: [userId, otherUserId].sort().join('-'),
        recipient: userId,
        read: false,
      },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error marking conversation as read' });
  }
}; 