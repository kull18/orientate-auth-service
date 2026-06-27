import { Server, Socket } from 'socket.io';
import { container } from '../../../../core/config/container';

interface CustomSocket extends Socket {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

export const initSocketIo = (io: Server): void => {
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Token de autenticación faltante.'));
    }

    const decoded = container.tokenService.verifyToken(token);
    if (!decoded) {
      return next(new Error('Token de acceso inválido o expirado.'));
    }

    socket.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  });

  io.on('connection', (socket: CustomSocket) => {
    const userId = socket.user?.id;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    console.log(`Cliente WebSocket conectado. ID de usuario: ${userId}`);

    // Unirse a la sala con su propio ID para recibir mensajes dirigidos a sí mismo
    socket.join(userId);

    // Evento send_message
    socket.on('send_message', async (data: { receiverId: string; text: string }, callback?: Function) => {
      try {
        const { receiverId, text } = data;
        if (!receiverId || typeof receiverId !== 'string') {
          socket.emit('error', { message: 'El receiverId es requerido y debe ser texto.' });
          return;
        }
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          socket.emit('error', { message: 'El contenido del mensaje es requerido y no puede estar vacío.' });
          return;
        }

        // Persistir el mensaje en la base de datos
        const savedMessage = await container.saveMessageUseCase.execute({
          senderId: userId,
          receiverId,
          messageText: text,
        });

        const msgPayload = {
          id: savedMessage.id,
          senderId: savedMessage.senderId,
          receiverId: savedMessage.receiverId,
          messageText: savedMessage.messageText,
          isRead: savedMessage.isRead,
          createdAt: savedMessage.createdAt,
        };

        // Emitir a la sala del destinatario
        io.to(receiverId).emit('new_message', msgPayload);

        // Emitir confirmación al emisor
        socket.emit('message_delivered', msgPayload);

        if (callback && typeof callback === 'function') {
          callback({ status: 'ok', message: msgPayload });
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error al procesar el mensaje.' });
      }
    });

    // Evento typing
    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      try {
        const { receiverId, isTyping } = data;
        if (!receiverId || typeof receiverId !== 'string') return;

        io.to(receiverId).emit('user_typing', {
          senderId: userId,
          isTyping: !!isTyping,
        });
      } catch (error) {
        // Manejar silenciosamente
      }
    });

    // Evento read_messages
    socket.on('read_messages', async (data: { senderId: string }) => {
      try {
        const { senderId } = data;
        if (!senderId || typeof senderId !== 'string') return;

        // El usuario actual (userId) marca como leídos los mensajes que le envió 'senderId'
        await container.markMessagesAsReadUseCase.execute({
          senderId,
          receiverId: userId,
        });

        // Emitir al emisor original que sus mensajes fueron leídos
        io.to(senderId).emit('messages_read', {
          senderId,
          receiverId: userId,
        });

        // Notificar también a la propia sesión del lector para sincronizar
        socket.emit('messages_read', {
          senderId,
          receiverId: userId,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error al marcar mensajes como leídos.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente WebSocket desconectado: ${userId}`);
    });
  });
};
