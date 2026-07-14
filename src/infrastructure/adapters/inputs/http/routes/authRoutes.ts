import { Router } from 'express';
import { container } from '../../../../../core/config/container';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';
import { roleMiddleware } from '../../../../../core/middlewares/roleMiddleware';
import { authLimiter } from '../../../../../core/middlewares/authLimiter';
import {
  validateRegister,
  validateLogin,
  validateRecoverPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateUserRoleUpdate,
} from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Endpoints públicos (con rate limiting para prevenir abusos)
router.post('/register', validateRegister, container.authController.register);
router.post('/login', authLimiter, validateLogin, container.authController.login);
router.post('/recover-password', authLimiter, validateRecoverPassword, container.authController.recoverPassword);
router.post('/reset-password', authLimiter, validateResetPassword, container.authController.resetPassword);

// Endpoints administrativos protegidos por autenticación y roles específicos
router.get('/roles', authMiddleware, roleMiddleware(['admin', 'orientador']), container.authController.listRoles);
router.patch('/users/:userId/role', authMiddleware, roleMiddleware(['admin']), validateUserRoleUpdate, container.authController.updateUserRole);
router.get('/admin/dashboard/stats', authMiddleware, roleMiddleware(['admin']), container.authController.getAdminStats);

// Endpoints generales protegidos por JWT
router.get('/me', authMiddleware, container.authController.getProfile);
router.patch('/me', authMiddleware, validateUpdateProfile, container.authController.updateProfile);
router.post('/universities/claim', authMiddleware, container.authController.claimUniversity);
router.get('/users/avatar-upload-url', container.authController.getAvatarUploadUrl);
router.put('/users/avatar', authMiddleware, container.authController.updateAvatar);
router.post('/logout', authMiddleware, container.authController.logout);

export default router;
