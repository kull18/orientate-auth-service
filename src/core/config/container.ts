import { pgPool, guidancePool } from '../database/pgPool';
import { Argon2Hasher } from '../security/argon2Hasher';
import { JwtTokenService } from '../security/jwtTokenService';
import { PostgresUserRepository } from '../../infrastructure/adapters/outputs/db/PostgresUserRepository';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { GetUserProfileUseCase } from '../../application/use-cases/GetUserProfileUseCase';
import { RecoverPasswordUseCase } from '../../application/use-cases/RecoverPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/UpdateUserProfileUseCase';
import { ListRolesUseCase } from '../../application/use-cases/ListRolesUseCase';
import { UpdateUserRoleUseCase } from '../../application/use-cases/UpdateUserRoleUseCase';
import { GetAdminStatsUseCase } from '../../application/use-cases/GetAdminStatsUseCase';
import { AuthController } from '../../infrastructure/adapters/inputs/http/controllers/AuthController';
import { PostgresChatRepository } from '../../infrastructure/adapters/outputs/db/PostgresChatRepository';
import { SaveMessageUseCase } from '../../application/use-cases/SaveMessageUseCase';
import { GetChatHistoryUseCase } from '../../application/use-cases/GetChatHistoryUseCase';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/MarkMessagesAsReadUseCase';
import { GetRecentContactsUseCase } from '../../application/use-cases/GetRecentContactsUseCase';
import { S3Service } from '../../infrastructure/adapters/outputs/s3/S3Service';
import { ChatController } from '../../infrastructure/adapters/inputs/http/controllers/ChatController';

// 1. Instanciar herramientas y servicios transversales (Core)
const passwordHasher = new Argon2Hasher();
const tokenService = new JwtTokenService();
const s3Service = new S3Service();

// 2. Instanciar adaptadores de salida (Persistencia)
const userRepository = new PostgresUserRepository(pgPool, guidancePool);
const chatRepository = new PostgresChatRepository(pgPool);

// 3. Instanciar casos de uso (Capa de Aplicación), inyectando los puertos requeridos
const registerUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const recoverPasswordUseCase = new RecoverPasswordUseCase(userRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, passwordHasher);
const updateProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const listRolesUseCase = new ListRolesUseCase(userRepository);
const updateRoleUseCase = new UpdateUserRoleUseCase(userRepository);
const getAdminStatsUseCase = new GetAdminStatsUseCase(userRepository);

// Chat use cases
const saveMessageUseCase = new SaveMessageUseCase(chatRepository, userRepository);
const getChatHistoryUseCase = new GetChatHistoryUseCase(chatRepository, userRepository);
const markMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(chatRepository);
const getRecentContactsUseCase = new GetRecentContactsUseCase(chatRepository);

// 4. Instanciar adaptadores de entrada (Express Controllers), inyectando los casos de uso
const authController = new AuthController(
  registerUseCase,
  loginUseCase,
  getUserProfileUseCase,
  recoverPasswordUseCase,
  resetPasswordUseCase,
  updateProfileUseCase,
  listRolesUseCase,
  updateRoleUseCase,
  getAdminStatsUseCase,
  s3Service,
  userRepository
);

const chatController = new ChatController(
  getChatHistoryUseCase,
  getRecentContactsUseCase
);

// Exportar el contenedor de dependencias del microservicio
export const container = {
  tokenService,
  authController,
  chatController,
  saveMessageUseCase,
  markMessagesAsReadUseCase,
};

