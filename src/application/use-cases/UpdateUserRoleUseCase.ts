import { NotFoundException, BusinessException } from '../../domain/exceptions/BusinessException';
import { UpdateUserRoleCommand, UpdateUserRoleUseCasePort, UserResponseDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class UpdateUserRoleUseCase implements UpdateUserRoleUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(command: UpdateUserRoleCommand): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`usuario con ID ${command.userId}`);
    }

    if (!command.roleName || typeof command.roleName !== 'string') {
      throw new BusinessException('El nombre de rol es requerido y debe ser un texto.', 400);
    }
    const roleName = command.roleName.trim().toLowerCase();

    // Roles permitidos según los requisitos del MVP
    const allowedRoles = ['estudiante', 'orientador', 'universidad', 'alumni'];
    if (!allowedRoles.includes(roleName)) {
      throw new BusinessException(`El rol '${roleName}' no es válido. Roles válidos: ${allowedRoles.join(', ')}`, 400);
    }

    // Buscar ID del nuevo rol
    const roleId = await this.userRepository.findRoleIdByName(roleName);
    if (!roleId) {
      throw new BusinessException(`El rol '${roleName}' no se encuentra en el sistema.`, 400);
    }

    // Actualizar rol del usuario
    user.roleId = roleId;

    // Guardar cambios en el repositorio
    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roleName: roleName,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
