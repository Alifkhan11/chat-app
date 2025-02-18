import { FC, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box 
      sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : messages.length === 0 ? (
        <Typography align="center" color="textSecondary">
          No messages yet
        </Typography>
      ) : (
        <>
          {messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: message.isSentByMe ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  backgroundColor: message.isSentByMe ? '#0084ff' : '#e4e6eb',
                  color: message.isSentByMe ? 'white' : 'black',
                  borderRadius: 2,
                  p: 1.5,
                  '& + &': { mt: 1 }
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem',
                    color: message.isSentByMe ? 'white' : 'text.secondary'
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
}; 