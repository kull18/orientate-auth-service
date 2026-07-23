import { randomUUID } from 'crypto';
import { BusinessException, NotFoundException } from '../../domain/exceptions/BusinessException';
import { RecoverPasswordCommand, RecoverPasswordUseCasePort } from '../ports/inputs/AuthUseCasesPort';
import { UserRepositoryPort } from '../ports/outputs/UserRepositoryPort';
import { ResendEmailSender } from '../../infrastructure/adapters/outputs/email/ResendEmailSender';

export class RecoverPasswordUseCase implements RecoverPasswordUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(command: RecoverPasswordCommand): Promise<string> {
    if (!command.email || typeof command.email !== 'string') {
      throw new BusinessException('El correo electrónico es requerido y debe ser un texto.', 400);
    }
    const email = command.email.trim().toLowerCase();

    // Buscar al usuario por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`usuario con email ${email}`);
    }

    // Generar token y expiración (1 hora)
    const resetToken = randomUUID();
    const resetExpires = new Date(Date.now() + 3600000); // +1 hora

    // Actualizar propiedades del usuario
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;

    // Guardar en repositorio
    await this.userRepository.save(user);

    // Enviar correo electrónico vía Resend
    const emailSender = new ResendEmailSender();
    await emailSender.sendResetPasswordEmail(email, resetToken);

    // Registrar en consola para que se pueda probar localmente sin servidor de correos
    console.log(`\n======================================================`);
    console.log(`[RECUPERACIÓN DE CONTRASEÑA]`);
    console.log(`Usuario: ${email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expira: ${resetExpires.toISOString()}`);
    console.log(`======================================================\n`);

    return resetToken;
  }
}
