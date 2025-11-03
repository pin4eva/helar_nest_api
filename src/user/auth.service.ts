import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../generated/client';
import { PrismaService } from '../prisma.service';
import { environments } from '../utils/environments';
import { parseExpiry } from '../utils/helpers';
import {
  CreatePasswordDTO,
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly pbkdf2Iterations = 100_000;
  private readonly pbkdf2KeyLength = 32; // 32 bytes = 256 bits
  private readonly pbkdf2Digest: 'sha256' | 'sha512' = 'sha256';

  // login
  async login(input: LoginDTO): Promise<LoginResponse> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const auth = await this.prismaService.auth.findFirst({
        where: { userId: user.id },
      });
      if (!auth) {
        const passwordUpdateToken = randomBytes(32).toString('hex');
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { passwordUpdateToken },
        });
        return {
          userId: user.id,
          message: 'Password update required',
          success: false,
          passwordUpdateRequired: true,
          passwordUpdateToken,
        };
      }

      const isMatch = this.comparePasswords(
        input.password,
        auth.salt,
        auth.password,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect email or password');
      }

      const { access_token, refresh_token } = this.generateTokens(user.id);
      return {
        userId: user.id,
        message: 'Login successful',
        success: true,
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  // register
  async register(input: RegisterDTO) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
      const newUser = await this.prismaService.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        },
      });

      const { salt, hash, iterations } = this.hashPassword(input.password);

      await this.prismaService.auth.create({
        data: {
          userId: newUser.id,
          password: hash,
          salt,
          iterations,
        },
      });
      return {
        message: 'Registration successful',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // create password
  async createPassword(input: CreatePasswordDTO) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (input.token !== user?.passwordUpdateToken) {
        throw new BadRequestException(
          'Password token not recognized. You may need to request a new password reset.',
        );
      }
      const { salt, hash, iterations } = this.hashPassword(input.password);

      await this.prismaService.auth.upsert({
        where: { userId: user.id },
        update: { password: hash, salt, iterations },
        create: { userId: user.id, password: hash, salt, iterations },
      });

      return {
        message: 'Password created successfully',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // refresh access token
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, environments.JWT_SECRETS) as {
        id: string;
        tokenType: string;
      };

      if (decoded.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.id },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { access_token, refresh_token } = this.generateTokens(user.id);
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  // change password

  // me
  async me(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        omit: {
          passwordUpdateToken: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // logout

  // verify email

  // send reset password link
  // reset password

  // decode token
  async decodeToken(token: string): Promise<User | null> {
    if (!token) return null;
    const bearerToken = token?.split(' ')[1] || token;
    token = bearerToken;
    try {
      const decoded = jwt.verify(token, environments.JWT_SECRETS) as {
        id?: string;
        tokenType?: string;
      };
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.id },
        omit: { passwordUpdateToken: true },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user as User;
    } catch (error) {
      throw error;
    }
  }

  // generate access and refresh tokens
  private generateTokens(userId: string): {
    access_token: string;
    refresh_token: string;
  } {
    const access_token = jwt.sign(
      { id: userId, tokenType: 'access' },
      environments.JWT_SECRETS,
      {
        expiresIn: parseExpiry(environments.ACCESS_TOKEN_EXPIRY),
      },
    );
    const refresh_token = jwt.sign(
      { id: userId, tokenType: 'refresh' },
      environments.JWT_SECRETS,
      {
        expiresIn: parseExpiry(environments.REFRESH_TOKEN_EXPIRY),
      },
    );
    return { access_token, refresh_token };
  }

  // ------------------ Password Hashing Utilities ------------------

  // Generate a cryptographically secure random salt
  private generateSalt(byteLength: number = 16): string {
    return randomBytes(byteLength).toString('hex');
  }

  // Derive a password key using PBKDF2 with the provided salt
  private deriveKey(password: string, saltHex: string): string {
    const salt = Buffer.from(saltHex, 'hex');
    const key = pbkdf2Sync(
      password,
      salt,
      this.pbkdf2Iterations,
      this.pbkdf2KeyLength,
      this.pbkdf2Digest,
    );
    return key.toString('hex');
  }

  // Public: create a salted password hash to store (returns salt and hash separately)
  private hashPassword(password: string): {
    salt: string;
    hash: string;
    iterations: number;
    digest: string;
    keylen: number;
  } {
    const salt = this.generateSalt();
    const hash = this.deriveKey(password, salt);
    return {
      salt,
      hash,
      iterations: this.pbkdf2Iterations,
      digest: this.pbkdf2Digest,
      keylen: this.pbkdf2KeyLength,
    };
  }

  // Public: verify a password using the stored salt and hash
  private comparePasswords(
    password: string,
    salt: string,
    expectedHash: string,
  ): boolean {
    const actualHashHex = this.deriveKey(password, salt);
    // Use constant-time comparison to mitigate timing attacks
    const a = Buffer.from(actualHashHex, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}
