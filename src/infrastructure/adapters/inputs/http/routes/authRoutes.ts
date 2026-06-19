import { Router } from 'express';
import { container } from '../../../../../core/config/container';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';

const router = Router();

// Endpoints públicos
router.post('/register', container.authController.register);
router.post('/login', container.authController.login);
router.post('/recover-password', container.authController.recoverPassword);
router.post('/reset-password', container.authController.resetPassword);
router.get('/roles', container.authController.listRoles);
router.patch('/users/:userId/role', container.authController.updateUserRole);

// Endpoints protegidos por JWT
router.get('/me', authMiddleware, container.authController.getProfile);
router.patch('/me', authMiddleware, container.authController.updateProfile);
router.post('/logout', authMiddleware, container.authController.logout);

export default router;
