import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/User';
import { BusinessException, UserAlreadyExistsException } from '../../domain/exceptions/BusinessException';
import { RegisterCommand, RegisterUserUseCasePort, UserResponseDTO } from '../ports/inputs/AuthUseCasesPort';
import { PasswordHasherPort } from '../ports/outputs/PasswordHasherPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class RegisterUserUseCase implements RegisterUserUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(command: RegisterCommand): Promise<UserResponseDTO> {
    if (!command.password) {
      throw new BusinessException('La contraseña es requerida para el registro.', 400);
    }

    const email = command.email.trim().toLowerCase();
    const name = command.name.trim();
    const roleName = command.roleName.trim().toLowerCase();

    // Roles permitidos según los requisitos del MVP
    const allowedRoles = ['estudiante', 'orientador', 'universidad', 'alumni'];
    if (!allowedRoles.includes(roleName)) {
      throw new BusinessException(`El rol '${roleName}' no es válido. Roles válidos: ${allowedRoles.join(', ')}`, 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    // Obtener id del rol por nombre
    const roleId = await this.userRepository.findRoleIdByName(roleName);
    if (!roleId) {
      throw new BusinessException(`El rol '${roleName}' no se encuentra en el sistema.`, 400);
    }

    // Hashear contraseña
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Instanciar entidad de dominio (se ejecutan las validaciones del constructor)
    const user = new User(
      randomUUID(),
      email,
      passwordHash,
      name,
      roleId,
      true, // isActive por defecto true
      new Date(),
      new Date()
    );

    // Persistir usuario
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      roleName: roleName,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
