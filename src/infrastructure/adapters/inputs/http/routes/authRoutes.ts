import { Router } from 'express';
import { container } from '../../../../../core/config/container';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';
import { roleMiddleware } from '../../../../../core/middlewares/roleMiddleware';
import { authLimiter } from '../../../../../core/middlewares/authLimiter';

const router = Router();

// Endpoints públicos (con rate limiting para prevenir abusos)
router.post('/register', container.authController.register);
router.post('/login', authLimiter, container.authController.login);
router.post('/recover-password', authLimiter, container.authController.recoverPassword);
router.post('/reset-password', authLimiter, container.authController.resetPassword);

// Endpoints administrativos protegidos por autenticación y roles específicos
router.get('/roles', authMiddleware, roleMiddleware(['admin', 'orientador']), container.authController.listRoles);
router.patch('/users/:userId/role', authMiddleware, roleMiddleware(['admin']), container.authController.updateUserRole);

// Endpoints generales protegidos por JWT
router.get('/me', authMiddleware, container.authController.getProfile);
router.patch('/me', authMiddleware, container.authController.updateProfile);
router.post('/logout', authMiddleware, container.authController.logout);

export default router;
