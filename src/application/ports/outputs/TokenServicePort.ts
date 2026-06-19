export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenServicePort {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
}
