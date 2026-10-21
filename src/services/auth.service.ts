import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { LoginDTO, AuthResponse } from '../types/auth.types';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  // Helper para sacar el hash del token
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error('Credenciales inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas.');
    }

    const secret = process.env.JWT_SECRET || 'secret_key';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    return await this.refreshTokenRepository.revokeToken(tokenHash);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }
}