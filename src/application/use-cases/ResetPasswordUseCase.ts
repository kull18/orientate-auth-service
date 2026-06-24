import { BusinessException } from '../../domain/exceptions/BusinessException';
import { ResetPasswordCommand, ResetPasswordUseCasePort } from '../ports/inputs/AuthUseCasesPort';
import { PasswordHasherPort } from '../ports/outputs/PasswordHasherPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';

export class ResetPasswordUseCase implements ResetPasswordUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    if (!command.token || typeof command.token !== 'string') {
      throw new BusinessException('El token de recuperación es requerido y debe ser un texto.', 400);
    }
    if (!command.newPassword || typeof command.newPassword !== 'string') {
      throw new BusinessException('La nueva contraseña es requerida y debe ser un texto.', 400);
    }

    const token = command.token.trim();

    // Buscar usuario por el token
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new BusinessException('El token de recuperación no es válido.', 400);
    }

    // Verificar si el token ya expiró
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BusinessException('El token de recuperación ha expirado.', 400);
    }

    // Hashear la nueva contraseña
    const hashedPassword = await this.passwordHasher.hash(command.newPassword);

    // Actualizar usuario
    user.passwordHash = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    // Guardar cambios
    await this.userRepository.save(user);
  }
}
