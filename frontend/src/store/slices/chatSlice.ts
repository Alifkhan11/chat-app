import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, User } from '../../types';

interface ChatState {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
}

const initialState: ChatState = {
  messages: [],
  users: [],
  selectedUser: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      state.messages = []; // Clear messages when changing user
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      // Remove temp message if exists
      state.messages = state.messages.filter(m => 
        !(m._id.toString().includes('temp') && m.text === message.text)
      );
      state.messages.push(message);
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: Date }>) => {
      const { userId, isOnline, lastSeen } = action.payload;
      const userIndex = state.users.findIndex(user => user._id === userId);
      if (userIndex !== -1) {
        state.users[userIndex].isOnline = isOnline;
        state.users[userIndex].lastSeen = lastSeen || null;
      }
      if (state.selectedUser?._id === userId) {
        state.selectedUser = {
          ...state.selectedUser,
          isOnline,
          lastSeen: lastSeen || null
        };
      }
    }
  }
});

export const { setUsers, setSelectedUser, setMessages, addMessage, updateUserStatus } = chatSlice.actions;
export default chatSlice.reducer; 