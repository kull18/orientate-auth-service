import { Request, Response, NextFunction } from 'express';
import {
  GetChatHistoryUseCasePort,
  GetRecentContactsUseCasePort
} from '../../../../../application/ports/inputs/ChatUseCasesPort';

export class ChatController {
  constructor(
    private readonly getChatHistoryUseCase: GetChatHistoryUseCasePort,
    private readonly getRecentContactsUseCase: GetRecentContactsUseCasePort
  ) {}

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }

      const { partnerId } = req.params;
      const limitStr = req.query.limit as string;
      const offsetStr = req.query.offset as string;

      const limit = limitStr ? parseInt(limitStr, 10) : 50;
      const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

      const history = await this.getChatHistoryUseCase.execute({
        userId1: req.user.userId,
        userId2: partnerId,
        limit,
        offset,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  };

  getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'No autorizado.',
        });
        return;
      }

      const contacts = await this.getRecentContactsUseCase.execute(req.user.userId);

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { contacts },
      });
    } catch (error) {
      next(error);
    }
  };
}
