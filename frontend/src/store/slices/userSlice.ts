import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
  users: User[];
  selectedUser: User | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: Date }>
    ) => {
      const { userId, isOnline, lastSeen } = action.payload;
      const userIndex = state.users.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          isOnline,
          lastSeen: lastSeen || state.users[userIndex].lastSeen,
        };
      }
      if (state.selectedUser?._id === userId) {
        state.selectedUser = {
          ...state.selectedUser,
          isOnline,
          lastSeen: lastSeen || state.selectedUser.lastSeen,
        };
      }
    },
  },
});

export const {
  setUsers,
  setSelectedUser,
  clearSelectedUser,
  updateUserStatus,
} = userSlice.actions;
export default userSlice.reducer; 