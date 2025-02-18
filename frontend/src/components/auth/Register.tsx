import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';

interface RegisterProps {
  onRegister: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const Register = ({ onRegister, onSwitchToLogin }: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(username, email, password, fullName);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              Register
            </Button>
          </form>
          <Button
            fullWidth
            onClick={onSwitchToLogin}
            sx={{ mt: 2 }}
          >
            Already have an account? Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}; 