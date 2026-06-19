import { Request, Response, NextFunction } from 'express';
import {
  RegisterUserUseCasePort,
  LoginUserUseCasePort,
  GetUserProfileUseCasePort,
  RecoverPasswordUseCasePort,
  ResetPasswordUseCasePort,
  UpdateUserProfileUseCasePort,
  ListRolesUseCasePort,
  UpdateUserRoleUseCasePort
} from '../../../../../application/ports/inputs/AuthUseCasesPort';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCasePort,
    private readonly loginUseCase: LoginUserUseCasePort,
    private readonly getProfileUseCase: GetUserProfileUseCasePort,
    private readonly recoverPasswordUseCase: RecoverPasswordUseCasePort,
    private readonly resetPasswordUseCase: ResetPasswordUseCasePort,
    private readonly updateProfileUseCase: UpdateUserProfileUseCasePort,
    private readonly listRolesUseCase: ListRolesUseCasePort,
    private readonly updateRoleUseCase: UpdateUserRoleUseCasePort
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name, password, roleName } = req.body;
      const user = await this.registerUseCase.execute({ email, name, password, roleName });
      
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
}
