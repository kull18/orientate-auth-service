export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  universityName?: string | null;
  verificationStatus?: string | null;
}

export interface TokenServicePort {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
}
