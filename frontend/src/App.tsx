import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { AuthContainer } from './components/auth/AuthContainer';
import { User } from './types';
import ChatContainer from './components/chat/ChatContainer';
import { RootState } from './store';
import { setCredentials, logout } from './store/slices/authSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0084ff',
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, token } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let newSocket: Socket | null = null;

    const connectSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        return;
      }

      if (newSocket?.connected) {
        newSocket.disconnect();
      }

      const socket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: false
      });

      socket.connect();

      newSocket = socket;

      socket.onAny((event, ...args) => {
        console.log('Socket Event:', event, args);
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully', socket.id);
        setSocket(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        if (error.message.includes('Authentication error')) {
          handleLogout();
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          console.log('Attempting to reconnect...');
          socket.connect();
        }
        setSocket(null);
      });
    };

    if (isLoggedIn) {
      connectSocket();
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, [isLoggedIn, token]);

  const handleAuthSuccess = (user: User, token: string) => {
    dispatch(setCredentials({ user, token }));
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    dispatch(logout());
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <AuthContainer onAuthSuccess={handleAuthSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', display: 'flex' }}>
        {socket && <ChatContainer socket={socket} onLogout={handleLogout} />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
