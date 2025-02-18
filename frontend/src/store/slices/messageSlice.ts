import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../types';

interface MessageState {
  messages: Message[];
}

const initialState: MessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload.map(message => ({
        ...message,
        createdAt: new Date(message.createdAt).toISOString()
      }));
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = {
        ...action.payload,
        createdAt: new Date(action.payload.createdAt).toISOString()
      };
      // Remove temp message if exists
      state.messages = state.messages.filter(m => 
        !(m._id.toString().includes('temp') && m.text === message.text)
      );
      state.messages.push(message);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer; 