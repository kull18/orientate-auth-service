import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import {
  RegisterUserUseCasePort,
  LoginUserUseCasePort,
  GetUserProfileUseCasePort,
  RecoverPasswordUseCasePort,
  ResetPasswordUseCasePort,
  UpdateUserProfileUseCasePort,
  ListRolesUseCasePort,
  UpdateUserRoleUseCasePort,
  GetAdminStatsUseCasePort
} from '../../../../../application/ports/inputs/AuthUseCasesPort';
import { S3Service } from '../../../outputs/s3/S3Service';
import { UserRepositoryPort } from '../../../../../application/ports/outputs/UserRepositoryPort';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCasePort,
    private readonly loginUseCase: LoginUserUseCasePort,
    private readonly getProfileUseCase: GetUserProfileUseCasePort,
    private readonly recoverPasswordUseCase: RecoverPasswordUseCasePort,
    private readonly resetPasswordUseCase: ResetPasswordUseCasePort,
    private readonly updateProfileUseCase: UpdateUserProfileUseCasePort,
    private readonly listRolesUseCase: ListRolesUseCasePort,
    private readonly updateRoleUseCase: UpdateUserRoleUseCasePort,
    private readonly getAdminStatsUseCase: GetAdminStatsUseCasePort,
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepositoryPort
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name, password, roleName, role, privacyAccepted } = req.body;
      const avatarUrl = req.body.avatarUrl || req.body.avatar_url;
      const finalRoleName = roleName || role;
      const user = await this.registerUseCase.execute({ 
        email, 
        name, 
        password, 
        roleName: finalRoleName, 
        privacyAccepted,
        avatarUrl
      });
      
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute({ email, password });
      
      // Enviar el token en las cabeceras de la respuesta
      res.setHeader('Authorization', `Bearer ${result.token}`);
      res.setHeader('x-auth-token', result.token);
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          user: result.user
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }
      
      const user = await this.getProfileUseCase.execute(req.user.userId);
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Stateless logout: limpiar cabeceras e indicar cliente la remoción
      res.setHeader('Authorization', '');
      res.setHeader('x-auth-token', '');
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Sesión cerrada correctamente. Por favor, elimine el token de su almacenamiento local.',
      });
    } catch (error) {
      next(error);
    }
  };

  recoverPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'El correo electrónico es requerido.',
        });
        return;
      }

      const token = await this.recoverPasswordUseCase.execute({ email });
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          message: 'Instrucciones de recuperación de contraseña generadas con éxito.',
          // Para pruebas locales sin servidor SMTP, devolvemos el token temporalmente
          token: token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'El token y la nueva contraseña son requeridos.',
        });
        return;
      }

      await this.resetPasswordUseCase.execute({ token, newPassword });
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Contraseña restablecida con éxito.',
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }

      const { email, name } = req.body;
      const user = await this.updateProfileUseCase.execute({
        userId: req.user.userId,
        email,
        name,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  listRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.listRolesUseCase.execute();
      
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { roles },
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roleName } = req.body;

      if (!userId || !roleName) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'El ID de usuario y el nombre de rol son requeridos.',
        });
        return;
      }

      const user = await this.updateRoleUseCase.execute({ userId, roleName });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  getAvatarUploadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Si el usuario está autenticado usamos su ID, de lo contrario generamos un UUID aleatorio temporal
      const fileId = (req.user && req.user.userId) ? req.user.userId : randomUUID();
      const { uploadUrl, fileUrl } = await this.s3Service.generatePresignedUploadUrl(fileId);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          uploadUrl,
          fileUrl
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }

      const avatarUrl = req.body.avatarUrl || req.body.avatar_url;
      if (!avatarUrl || typeof avatarUrl !== 'string') {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'La URL del avatar es requerida y debe ser un texto.',
        });
        return;
      }

      await this.userRepository.updateAvatarUrl(req.user.userId, avatarUrl);

      // Obtener el perfil actualizado para retornarlo completo en la respuesta
      const updatedUser = await this.getProfileUseCase.execute(req.user.userId);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  };

  claimUniversity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }

      const { cct, rfc } = req.body;
      if (!cct || typeof cct !== 'string' || cct.trim().length !== 10) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'La clave CCT es requerida y debe tener exactamente 10 caracteres.',
        });
        return;
      }
      if (!rfc || typeof rfc !== 'string' || rfc.trim().length < 12 || rfc.trim().length > 13) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'El RFC es requerido y debe tener 12 o 13 caracteres.',
        });
        return;
      }

      const cleanCct = cct.trim().toUpperCase();
      const cleanRfc = rfc.trim().toUpperCase();

      // 1. Validar que el usuario sea de rol UNIVERSITY
      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          status: 'error',
          statusCode: 404,
          message: 'Usuario no encontrado.',
        });
        return;
      }

      const roleName = await this.userRepository.findRoleNameById(user.roleId);
      if (roleName !== 'universidad') {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Solo los usuarios con el rol universidad pueden reclamar un perfil institucional.',
        });
        return;
      }

      // 2. Validar que el CCT o RFC no haya sido reclamado y verificado por otra persona
      const query = `
        SELECT id FROM users 
        WHERE (claimed_cct = $1 OR rfc = $2) AND verification_status = 'VERIFIED' AND id != $3
      `;
      const dbResult = await (this.userRepository as any).pool.query(query, [cleanCct, cleanRfc, user.id]);
      if (dbResult.rows.length > 0) {
        res.status(409).json({
          status: 'error',
          statusCode: 409,
          message: 'Esta clave CCT o RFC ya ha sido verificada por otro representante.',
        });
        return;
      }

      // 3. Simulación de llamadas a APIs externas de CCT (SEP) y RFC (SAT)
      if (!cleanCct.startsWith('07')) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'El CCT ingresado no pertenece al estado de Chiapas o no es válido.',
        });
        return;
      }

      // Generamos un nombre oficial basado en el CCT para la simulación
      let officialUnivName = 'Universidad Tecnológica de Chiapas';
      if (cleanCct === '07USU0012A') {
        officialUnivName = 'Universidad Autónoma de Chiapas';
      } else if (cleanCct === '07USU0025D') {
        officialUnivName = 'Universidad de Ciencias y Artes de Chiapas';
      } else if (cleanCct.includes('TEC')) {
        officialUnivName = 'Instituto Tecnológico de Tuxtla Gutiérrez';
      }

      // 4. Actualizar el usuario con la información validada
      user.claimedCct = cleanCct;
      user.rfc = cleanRfc;
      user.universityName = officialUnivName;
      user.verificationStatus = 'VERIFIED';

      await this.userRepository.save(user);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Universidad reclamada y verificada con éxito.',
        data: {
          universityName: officialUnivName,
          verificationStatus: user.verificationStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.getAdminStatsUseCase.execute();
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
