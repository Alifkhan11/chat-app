import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export const Login = ({ onLogin, onSwitchToRegister }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
          <Button
            fullWidth
            onClick={onSwitchToRegister}
            sx={{ mt: 2 }}
          >
            Don't have an account? Register
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}; 