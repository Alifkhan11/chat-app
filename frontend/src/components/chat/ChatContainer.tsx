import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { Box, Typography } from '@mui/material';
import { Message, User } from '../../types';
import { UserList } from './UserList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { RootState } from '../../store';
import { addMessage, setMessages } from '../../store/slices/messageSlice';
import { setUsers, setSelectedUser, updateUserStatus } from '../../store/slices/userSlice';

interface ChatContainerProps {
  socket: Socket;
  onLogout: () => void;
}

const ChatContainer = ({ socket, onLogout }: ChatContainerProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user)!;
  const selectedUser = useSelector((state: RootState) => state.users.selectedUser);
  const messages = useSelector((state: RootState) => state.messages.messages);
  const users = useSelector((state: RootState) => state.users.users);
  const [isLoading, setIsLoading] = useState(false);
  console.log(currentUser);
  const handleUserSelect = useCallback((user: User) => {
    dispatch(setSelectedUser(user));
  }, [dispatch]);

  const handleNewMessage = useCallback((message: Message) => {
    if (!selectedUser) return;

    const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
    const recipientId = typeof message.recipient === 'string' ? message.recipient : message.recipient._id;

    const conversationId = [currentUser.id, selectedUser._id].sort().join('-');
    const messageConversationId = [senderId, recipientId].sort().join('-');

    if (messageConversationId === conversationId) {
      const messageWithUsers: Message = {
        ...message,
        sender: senderId === currentUser.id ? currentUser : selectedUser,
        recipient: recipientId === currentUser.id ? currentUser : selectedUser,
        isSentByMe: senderId === currentUser.id
      };
      
      // Remove any temporary version of this message
      const existingMessage = messages.find(m => 
        m._id.toString().includes('temp') && 
        m.text === message.text &&
        Date.now() - new Date(m.createdAt).getTime() < 5000
      );
      
      if (!existingMessage) {
        dispatch(addMessage(messageWithUsers));
      }
    }
  }, [currentUser, selectedUser, dispatch, messages]);

  const handlePreviousMessages = useCallback((messages: Message[]) => {
    const processedMessages = messages.map(message => {
      const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
      return {
        ...message,
        isSentByMe: senderId === currentUser.id
      };
    });
    dispatch(setMessages(processedMessages));
    setIsLoading(false);
  }, [currentUser.id, dispatch]);

  useEffect(() => {
    // Listen for user list updates
    socket.on('user_list', (users: User[]) => {
      console.log('Received users:', users);
      const filteredUsers = users.filter(user => user._id !== currentUser.id);
      dispatch(setUsers(filteredUsers));
    });

    // Listen for user status updates
    socket.on('user_status', (data: { userId: string; isOnline: boolean; lastSeen: Date }) => {
      console.log('User status update:', data);
      dispatch(updateUserStatus(data));
    });

    // Listen for new messages
    socket.on('new_message', (message: Message) => {
      console.log('Received new message:', message);
      handleNewMessage(message);
    });

    // Listen for previous messages
    socket.on('previous_messages', (messages: Message[]) => {
      console.log('Received previous messages:', messages);
      handlePreviousMessages(messages);
    });

    // Listen for message sent confirmation
    socket.on('message_sent', (response: { success: boolean, message: Message }) => {
      console.log('Message sent response:', response);
      if (response.success) {
        handleNewMessage(response.message);
      }
    });

    // Listen for message errors
    socket.on('message_error', (error: { error: string }) => {
      console.error('Message error:', error);
    });

    // Request initial user list
    socket.emit('get_users');

    return () => {
      socket.off('user_list');
      socket.off('user_status');
      socket.off('new_message');
      socket.off('previous_messages');
      socket.off('message_sent');
      socket.off('message_error');
    };
  }, [socket, currentUser.id, handleNewMessage, handlePreviousMessages, dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setIsLoading(true);
      const conversationId = [currentUser.id, selectedUser._id].sort().join('-');
      
      // Leave previous conversation if any
      socket.emit('leave_conversation', { conversationId: currentUser.id });
      
      // Join new conversation
      socket.emit('join_conversation', { conversationId });
      
      // Request messages for this conversation
      socket.emit('get_messages', { conversationId });
    }
  }, [selectedUser, currentUser.id, socket]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedUser) return;

    const tempId = `temp-${Date.now()}`;
    const message: Message = {
      _id: tempId,
      text: content,
      sender: currentUser,
      recipient: selectedUser,
      createdAt: new Date().toISOString(),
      read: false,
      isSentByMe: true
    };

    socket.emit('private_message', {
      recipientId: selectedUser._id,
      text: content,
      conversationId: [currentUser.id, selectedUser._id].sort().join('-')
    });

    // Only add temp message if it's not a duplicate
    const isDuplicate = messages.some(m => m.text === content && Date.now() - new Date(m.createdAt).getTime() < 1000);
    if (!isDuplicate) {
      dispatch(addMessage(message));
    }
  }, [currentUser, selectedUser, socket, dispatch, messages]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
      <UserList
        users={users}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
        onLogout={onLogout}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              {selectedUser.username}
            </Typography>
            <MessageList
              messages={messages}
              isLoading={isLoading}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="h6" color="textSecondary">
              Select a user to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatContainer;