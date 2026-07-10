import { User } from '../../../domain/entities/User';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findRoleIdByName(roleName: string): Promise<string | null>;
  findRoleNameById(roleId: string): Promise<string | null>;
  findByResetToken(token: string): Promise<User | null>;
  findAllRoles(): Promise<{ id: string; name: string; description: string | null }[]>;
  updateAvatarUrl(userId: string, avatarUrl: string): Promise<void>;
}
