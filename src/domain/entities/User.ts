import { BusinessException } from '../exceptions/BusinessException';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public name: string,
    public roleId: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public passwordResetToken?: string | null,
    public passwordResetExpires?: Date | null
  ) {
    this.validateEmail(email);
    this.validateName(name);
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BusinessException('El formato de correo electrónico no es válido.');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new BusinessException('El nombre debe tener al menos 2 caracteres.');
    }
  }

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }
}
