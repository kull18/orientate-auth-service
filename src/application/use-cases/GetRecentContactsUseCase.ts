import { GetRecentContactsUseCasePort } from '../ports/inputs/ChatUseCasesPort';
import { ChatRepositoryPort, RecentContact } from '../ports/outputs/ChatRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class GetRecentContactsUseCase implements GetRecentContactsUseCasePort {
  constructor(private readonly chatRepository: ChatRepositoryPort) {}

  async execute(userId: string): Promise<RecentContact[]> {
    if (!userId) {
      throw new BusinessException('El ID de usuario es requerido.', 400);
    }
    return this.chatRepository.getRecentContacts(userId);
  }
}
