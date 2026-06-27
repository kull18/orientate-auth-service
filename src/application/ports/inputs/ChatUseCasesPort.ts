import { ChatMessage } from '../../../domain/entities/ChatMessage';
import { RecentContact } from '../outputs/ChatRepositoryPort';

export interface SaveMessageCommand {
  senderId: string;
  receiverId: string;
  messageText: string;
}

export interface GetChatHistoryQuery {
  userId1: string;
  userId2: string;
  limit: number;
  offset: number;
}

export interface MarkMessagesAsReadCommand {
  senderId: string;
  receiverId: string;
}

export interface SaveMessageUseCasePort {
  execute(command: SaveMessageCommand): Promise<ChatMessage>;
}

export interface GetChatHistoryUseCasePort {
  execute(query: GetChatHistoryQuery): Promise<ChatMessage[]>;
}

export interface MarkMessagesAsReadUseCasePort {
  execute(command: MarkMessagesAsReadCommand): Promise<void>;
}

export interface GetRecentContactsUseCasePort {
  execute(userId: string): Promise<RecentContact[]>;
}
