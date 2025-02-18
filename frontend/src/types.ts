export interface Message {
  _id: string;
  text: string;
  sender: User | string;
  recipient: User | string;
  conversationId?: string;
  createdAt: string;
  read: boolean;
  isSentByMe?: boolean;
}

export interface User {
  _id: string;
  id?: string; // Optional id property for backward compatibility
  username: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: Date | null;
} 