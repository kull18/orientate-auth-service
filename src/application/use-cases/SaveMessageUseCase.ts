import { randomUUID } from 'crypto';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { SaveMessageCommand, SaveMessageUseCasePort } from '../ports/inputs/ChatUseCasesPort';
import { ChatRepositoryPort } from '../ports/outputs/ChatRepositoryPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';
import { BusinessException, NotFoundException } from '../../domain/exceptions/BusinessException';

export class SaveMessageUseCase implements SaveMessageUseCasePort {
  constructor(
    private readonly chatRepository: ChatRepositoryPort,
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: SaveMessageCommand): Promise<ChatMessage> {
    const { senderId, receiverId, messageText } = command;

    if (!senderId) throw new BusinessException('El ID del remitente es requerido.', 400);
    if (!receiverId) throw new BusinessException('El ID del destinatario es requerido.', 400);
    if (senderId === receiverId) {
      throw new BusinessException('No puedes enviarte un mensaje a ti mismo.', 400);
    }

    const senderExists = await this.userRepository.findById(senderId);
    if (!senderExists) {
      throw new NotFoundException(`Remitente con ID ${senderId}`);
    }

    const receiverExists = await this.userRepository.findById(receiverId);
    if (!receiverExists) {
      throw new NotFoundException(`Destinatario con ID ${receiverId}`);
    }

    const chatMessage = new ChatMessage(
      randomUUID(),
      senderId,
      receiverId,
      messageText,
      false,
      new Date()
    );

    return this.chatRepository.saveMessage(chatMessage);
  }
}
