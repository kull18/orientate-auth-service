import { ChatMessage } from '../../domain/entities/ChatMessage';
import { GetChatHistoryQuery, GetChatHistoryUseCasePort } from '../ports/inputs/ChatUseCasesPort';
import { ChatRepositoryPort } from '../ports/outputs/ChatRepositoryPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';
import { BusinessException, NotFoundException } from '../../domain/exceptions/BusinessException';

export class GetChatHistoryUseCase implements GetChatHistoryUseCasePort {
  constructor(
    private readonly chatRepository: ChatRepositoryPort,
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(query: GetChatHistoryQuery): Promise<ChatMessage[]> {
    const { userId1, userId2, limit, offset } = query;

    if (!userId1) throw new BusinessException('El ID del primer usuario es requerido.', 400);
    if (!userId2) throw new BusinessException('El ID del segundo usuario es requerido.', 400);

    const user1Exists = await this.userRepository.findById(userId1);
    if (!user1Exists) {
      throw new NotFoundException(`Usuario con ID ${userId1}`);
    }

    const user2Exists = await this.userRepository.findById(userId2);
    if (!user2Exists) {
      throw new NotFoundException(`Usuario con ID ${userId2}`);
    }

    const parsedLimit = Math.max(1, Math.min(100, limit || 50));
    const parsedOffset = Math.max(0, offset || 0);

    return this.chatRepository.getChatHistory(userId1, userId2, parsedLimit, parsedOffset);
  }
}
