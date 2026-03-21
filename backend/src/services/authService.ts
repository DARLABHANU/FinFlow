import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  async register(email: string, passwordHash: string, name?: string, isBiometricEnabled?: boolean): Promise<any> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(passwordHash, 12);
    const user = await userRepository.createUser({ 
      email, 
      passwordHash: hashedPassword, 
      name,
      isBiometricEnabled: isBiometricEnabled !== undefined ? isBiometricEnabled : true
    });
    return { id: user._id, email: user.email, name: user.name, isBiometricEnabled: user.isBiometricEnabled };
  }

  async login(email: string, passwordHash: string): Promise<any> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const isMatched = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isMatched) {
      throw new Error('Invalid credentials');
    }
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    return { 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        avatar: user.avatar, 
        isBiometricEnabled: user.isBiometricEnabled 
      }, 
      accessToken, 
      refreshToken 
    };
  }

  async refresh(token: string): Promise<any> {
    try {
      const decoded: any = verifyRefreshToken(token);
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      const accessToken = generateAccessToken(user._id.toString());
      return { accessToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async getUserById(id: string): Promise<any> {
    return await userRepository.findById(id);
  }
}

export default new AuthService();
