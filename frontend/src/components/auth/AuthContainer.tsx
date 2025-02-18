import { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { authService } from '../../services/authService';
import { User } from '../../types';

interface AuthContainerProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export const AuthContainer = ({ onAuthSuccess }: AuthContainerProps) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    try {
      const { user, token } = await authService.login(username, password);
      onAuthSuccess(user, token);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleRegister = async (username: string, email: string, password: string, fullName: string) => {
    try {
      const { user, token } = await authService.register(username, email, password, fullName);
      onAuthSuccess(user, token);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return isRegistering ? (
    <Register
      onRegister={handleRegister}
      onSwitchToLogin={() => setIsRegistering(false)}
    />
  ) : (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => setIsRegistering(true)}
    />
  );
}; 