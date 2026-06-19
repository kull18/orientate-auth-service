import { BusinessException, NotFoundException } from '../../domain/exceptions/BusinessException';
import { GetUserProfileUseCasePort, UserResponseDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class GetUserProfileUseCase implements GetUserProfileUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<UserResponseDTO> {
    // Buscar el usuario por ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId}`);
    }

    // Obtener nombre del rol
    const roleName = await this.userRepository.findRoleNameById(user.roleId);
    if (!roleName) {
      throw new BusinessException('Inconsistencia en el sistema: el rol asignado al usuario no fue encontrado.', 500);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: roleName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
