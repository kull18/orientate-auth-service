import { ApproveUniversityUseCasePort } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export class ApproveUniversityUseCase implements ApproveUniversityUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BusinessException('El usuario no existe.', 404);
    }

    const roleName = await this.userRepository.findRoleNameById(user.roleId);
    if (roleName !== 'universidad') {
      throw new BusinessException('El usuario especificado no tiene el rol de universidad.', 400);
    }

    await this.userRepository.updateVerificationStatus(userId, 'VERIFIED', true);
  }
}
