import { FC, useState, ChangeEvent, FormEvent } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export const MessageInput: FC<MessageInputProps> = ({ onSendMessage }) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    onSendMessage(messageInput.trim());
    setMessageInput('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        value={messageInput}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setMessageInput(e.target.value)
        }
        placeholder="Type a message..."
        variant="outlined"
        size="small"
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!messageInput.trim()}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}; 