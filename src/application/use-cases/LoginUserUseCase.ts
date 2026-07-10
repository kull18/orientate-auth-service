import { BusinessException, InvalidCredentialsException } from '../../domain/exceptions/BusinessException';
import { LoginCommand, LoginUserUseCasePort, UserResponseDTO } from '../ports/inputs/AuthUseCasesPort';
import { PasswordHasherPort } from '../ports/outputs/PasswordHasherPort';
import { TokenServicePort } from '../ports/outputs/TokenServicePort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class LoginUserUseCase implements LoginUserUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(command: LoginCommand): Promise<{ token: string; user: UserResponseDTO }> {
    if (!command.email || typeof command.email !== 'string') {
      throw new BusinessException('El correo electrónico es requerido para el inicio de sesión y debe ser un texto.', 400);
    }
    if (!command.password || typeof command.password !== 'string') {
      throw new BusinessException('La contraseña es requerida para el inicio de sesión y debe ser un texto.', 400);
    }

    const email = command.email.trim().toLowerCase();

    // Buscar el usuario por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new BusinessException('La cuenta de usuario está desactivada.', 403);
    }

    // Comparar contraseña
    const isPasswordValid = await this.passwordHasher.compare(command.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Obtener nombre del rol
    const roleName = await this.userRepository.findRoleNameById(user.roleId);
    if (!roleName) {
      throw new BusinessException('Inconsistencia en el sistema: el rol asignado al usuario no fue encontrado.', 500);
    }

    // Generar Token JWT
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      role: roleName,
      universityName: user.universityName,
      verificationStatus: user.verificationStatus,
    });

    const userDto: UserResponseDTO = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: roleName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      privacyAccepted: user.privacyAccepted,
      privacyAcceptedAt: user.privacyAcceptedAt,
      avatarUrl: user.avatarUrl,
      claimedCct: user.claimedCct,
      rfc: user.rfc,
      universityName: user.universityName,
      verificationStatus: user.verificationStatus,
    };

    return { token, user: userDto };
  }
}
