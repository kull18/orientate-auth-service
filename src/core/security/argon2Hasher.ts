import argon2 from 'argon2';
import { PasswordHasherPort } from '../../application/ports/outputs/PasswordHasherPort';

export class Argon2Hasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }
}
