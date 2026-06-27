import { ChatMessage } from '../../../domain/entities/ChatMessage';

export interface RecentContact {
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactRole: string;
  lastMessageText: string;
  lastMessageCreatedAt: Date;
  unreadCount: number;
}

export interface ChatRepositoryPort {
  saveMessage(message: ChatMessage): Promise<ChatMessage>;
  getChatHistory(userId1: string, userId2: string, limit: number, offset: number): Promise<ChatMessage[]>;
  markAsRead(senderId: string, receiverId: string): Promise<void>;
  getRecentContacts(userId: string): Promise<RecentContact[]>;
}
