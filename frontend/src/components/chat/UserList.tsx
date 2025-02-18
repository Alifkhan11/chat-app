import { FC } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge,
  Button,
  Typography,
} from '@mui/material';
import { User } from '../../types';

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  onLogout: () => void;
}

export const UserList: FC<UserListProps> = ({
  users,
  selectedUser,
  onUserSelect,
  onLogout,
}) => {
  return (
    <Box
      sx={{
        width: 300,
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6">Users</Typography>
      </Box>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {users.map((user) => (
          <ListItem
            key={user._id}
            button
            selected={selectedUser?._id === user._id}
            onClick={() => onUserSelect(user)}
            sx={{
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              backgroundColor:
                selectedUser?._id === user._id ? '#e3f2fd' : 'transparent',
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              color={user.isOnline ? 'success' : 'error'}
            >
              <Avatar sx={{ mr: 2 }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.fullName} />
                ) : (
                  user.fullName[0]
                )}
              </Avatar>
            </Badge>
            <ListItemText
              primary={user.fullName}
              secondary={user.isOnline ? 'Online' : 'Offline'}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onLogout} fullWidth variant="outlined" color="primary">
          Logout
        </Button>
      </Box>
    </Box>
  );
}; 