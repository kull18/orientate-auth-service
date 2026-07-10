import { NotFoundException, UserAlreadyExistsException, BusinessException } from '../../domain/exceptions/BusinessException';
import { UpdateUserProfileCommand, UpdateUserProfileUseCasePort, UserResponseDTO } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class UpdateUserProfileUseCase implements UpdateUserProfileUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(command: UpdateUserProfileCommand): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`usuario con ID ${command.userId}`);
    }

    // Actualizar email si se proporciona
    if (command.email !== undefined) {
      if (typeof command.email !== 'string') {
        throw new BusinessException('El correo electrónico debe ser un texto.', 400);
      }
      const email = command.email.trim().toLowerCase();
      if (email !== user.email) {
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new BusinessException('El formato de correo electrónico no es válido.', 400);
        }

        // Verificar si el email ya está en uso por otro usuario
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          throw new UserAlreadyExistsException(email);
        }
        user.email = email;
      }
    }

    // Actualizar nombre si se proporciona
    if (command.name !== undefined) {
      if (typeof command.name !== 'string') {
        throw new BusinessException('El nombre debe ser un texto.', 400);
      }
      const name = command.name.trim();
      if (name.length < 2) {
        throw new BusinessException('El nombre debe tener al menos 2 caracteres.', 400);
      }
      user.name = name;
    }

    // Guardar cambios en el repositorio
    const updatedUser = await this.userRepository.save(user);

    // Obtener nombre del rol
    const roleName = await this.userRepository.findRoleNameById(updatedUser.roleId);
    if (!roleName) {
      throw new BusinessException('Inconsistencia en el sistema: el rol asignado al usuario no fue encontrado.', 500);
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roleName: roleName,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      privacyAccepted: updatedUser.privacyAccepted,
      privacyAcceptedAt: updatedUser.privacyAcceptedAt,
      avatarUrl: updatedUser.avatarUrl,
    };
  }
}
