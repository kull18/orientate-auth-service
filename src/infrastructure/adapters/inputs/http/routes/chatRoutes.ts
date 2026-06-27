import { Router } from 'express';
import { container } from '../../../../../core/config/container';
import { authMiddleware } from '../../../../../core/middlewares/authMiddleware';
import { validateChatHistory } from '../../../../../core/middlewares/validationMiddleware';

const router = Router();

// Endpoints protegidos por JWT para historial y contactos recientes
router.get('/history/:partnerId', authMiddleware, validateChatHistory, container.chatController.getHistory);
router.get('/contacts', authMiddleware, container.chatController.getContacts);

export default router;
