export interface Message {
  _id: string;
  text: string;
  sender: User | string;
  recipient: User | string;
  createdAt: Date;
  read: boolean;
  isSentByMe?: boolean;
}

export interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen: Date | null;
}

export interface AuthResponse {
  token: string;
  user: User;
} 