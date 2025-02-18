import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  private: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for conversation
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema); 