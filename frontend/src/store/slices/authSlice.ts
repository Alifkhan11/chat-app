import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
}

// Load initial state from localStorage
const loadState = (): AuthState => {
  try {
    const serializedUser = localStorage.getItem('user');
    const serializedToken = localStorage.getItem('token');
    if (serializedUser && serializedToken) {
      return {
        user: JSON.parse(serializedUser),
        token: serializedToken,
        isLoggedIn: true,
      };
    }
  } catch (err) {
    console.error('Error loading auth state:', err);
  }
  return {
    user: null,
    token: null,
    isLoggedIn: false,
  };
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 