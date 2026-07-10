export interface RegisterCommand {
  email: string;
  name: string;
  password?: string; // raw password
  roleName: string;
  privacyAccepted?: boolean;
  avatarUrl?: string;
  claimedCct?: string;
  rfc?: string;
}

export interface LoginCommand {
  email: string;
  password?: string; // raw password
}

export interface RecoverPasswordCommand {
  email: string;
}

export interface ResetPasswordCommand {
  token: string;
  newPassword?: string;
}

export interface UpdateUserProfileCommand {
  userId: string;
  email?: string;
  name?: string;
}

export interface UpdateUserRoleCommand {
  userId: string;
  roleName: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  roleName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  privacyAccepted: boolean;
  privacyAcceptedAt?: Date | null;
  avatarUrl?: string | null;
  claimedCct?: string | null;
  rfc?: string | null;
  universityName?: string | null;
  verificationStatus?: string | null;
}

export interface RoleDTO {
  id: string;
  name: string;
  description: string | null;
}

export interface RegisterUserUseCasePort {
  execute(command: RegisterCommand): Promise<UserResponseDTO>;
}

export interface LoginUserUseCasePort {
  execute(command: LoginCommand): Promise<{ token: string; user: UserResponseDTO }>;
}

export interface GetUserProfileUseCasePort {
  execute(userId: string): Promise<UserResponseDTO>;
}

export interface RecoverPasswordUseCasePort {
  execute(command: RecoverPasswordCommand): Promise<string>;
}

export interface ResetPasswordUseCasePort {
  execute(command: ResetPasswordCommand): Promise<void>;
}

export interface UpdateUserProfileUseCasePort {
  execute(command: UpdateUserProfileCommand): Promise<UserResponseDTO>;
}

export interface ListRolesUseCasePort {
  execute(): Promise<RoleDTO[]>;
}

export interface UpdateUserRoleUseCasePort {
  execute(command: UpdateUserRoleCommand): Promise<UserResponseDTO>;
}
