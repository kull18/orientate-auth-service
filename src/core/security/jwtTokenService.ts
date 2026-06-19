import jwt from 'jsonwebtoken';
import { TokenPayload, TokenServicePort } from '../../application/ports/outputs/TokenServicePort';
import { env } from '../config/env';

export class JwtTokenService implements TokenServicePort {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      if (decoded && typeof decoded === 'object' && 'userId' in decoded && 'email' in decoded && 'role' in decoded) {
        return {
          userId: (decoded as any).userId,
          email: (decoded as any).email,
          role: (decoded as any).role,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }
}
