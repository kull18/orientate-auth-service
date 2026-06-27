import { MarkMessagesAsReadCommand, MarkMessagesAsReadUseCasePort } from '../ports/inputs/ChatUseCasesPort';
import { ChatRepositoryPort } from '../ports/outputs/ChatRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class MarkMessagesAsReadUseCase implements MarkMessagesAsReadUseCasePort {
  constructor(private readonly chatRepository: ChatRepositoryPort) {}

  async execute(command: MarkMessagesAsReadCommand): Promise<void> {
    const { senderId, receiverId } = command;

    if (!senderId) throw new BusinessException('El ID del remitente es requerido.', 400);
    if (!receiverId) throw new BusinessException('El ID del receptor es requerido.', 400);

    await this.chatRepository.markAsRead(senderId, receiverId);
  }
}
