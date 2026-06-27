import { BusinessException } from '../exceptions/BusinessException';

export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly messageText: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date
  ) {
    this.validateMessageText(messageText);
  }

  private validateMessageText(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new BusinessException('El mensaje no puede estar vacío.');
    }
  }
}
