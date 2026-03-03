import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubscriptionStatusEnum,
  User,
  UserProfileTypeEnum,
} from '../generated/client';
import { environments } from '../utils/environments';
import { parseExpiry } from '../utils/helpers';
import {
  CreatePasswordDTO,
  LoginDTO,
  LoginResponse,
  SessionInfo,
  VerifyEmailTokenDTO,
} from './auth.dto';
import { CreateUserDTO } from './user.dto';
const tokenOptions: jwt.SignOptions = {
  expiresIn: environments.ACCESS_TOKEN_EXPIRY,
  issuer: 'helar.law',
  algorithm: 'HS256',
  audience: 'helar-clients',
};

type JwtPayload = jwt.JwtPayload & {
  tokenType?: string;
  id: string;
  sessionId: string;
};

@Injectable()
export class AuthService {
  private readonly SET_PASSWORD_PATH = 'set-password';
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly emailService: EmailService,
  ) {}

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

      const { access_token, refresh_token } = await this.generateTokens(
        user.id,
      );
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
  async signup(input: CreateUserDTO, request: Request) {
    const origin = request.headers.origin;
    const email = input.email.toLowerCase().trim();
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }

      // Send verification email instead of setting password directly
      const verificationToken = randomBytes(32).toString('hex');
      await this.prismaService.user.create({
        data: {
          ...input,
          email,
          emailToken: verificationToken,
        },
      });
      const activationLink = `${origin}/${this.SET_PASSWORD_PATH}?token=${verificationToken}`;
      await this.emailService.sendActivationEmail({
        to: email,
        activationLink,
        name: input.firstName,
        origin: origin,
      });

      return {
        message: 'Please verify your email to complete registration',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserActiveSubscription(userId: string) {
    const subscription = await this.prismaService.subscription.findFirst({
      where: {
        userId,
        status: {
          in: [SubscriptionStatusEnum.Active, SubscriptionStatusEnum.Trialing],
        },
      },
      select: {
        id: true,
        planCode: true,
        status: true,
        startsAt: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        nextBillingAt: true,
        trialEndsAt: true,
        cancelledAt: true,
      },
    });
    return subscription;
  }

  async resendVerificationEmail(email: string, request: Request) {
    const origin = request.headers.origin;
    email = email.toLowerCase().trim();
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      const verificationToken = randomBytes(32).toString('hex');
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { emailToken: verificationToken },
      });

      const activationLink = `${origin}/${this.SET_PASSWORD_PATH}?token=${verificationToken}`;
      await this.emailService.sendActivationEmail({
        to: email,
        activationLink,
        name: user.firstName,
      });

      return {
        message: 'Verification email resent successfully',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // verify email token and set password

  async verifyEmailToken({
    token,
    password,
  }: VerifyEmailTokenDTO): Promise<{ message: string; success: boolean }> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { emailToken: token },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailToken: null,
          profileType: UserProfileTypeEnum.User,
        },
      });

      const { salt, hash, iterations } = this.hashPassword(password);
      await this.prismaService.auth.upsert({
        where: { userId: user.id },
        update: { password: hash, salt, iterations },
        create: { userId: user.id, password: hash, salt, iterations },
      });

      return {
        message: 'Email verified successfully',
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

      const { access_token, refresh_token } = await this.generateTokens(
        user.id,
      );
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
        include: {
          subscriptions: {
            select: {
              id: true,
              planCode: true,
              status: true,
              nextBillingAt: true,
              createdAt: true,
              amount: true,
              plan: true,
              providerSubscriptionId: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      // const activeSubscription = await this.getUserActiveSubscription(userId);
      const activeSubscription = user.subscriptions.find((sub) => {
        return sub.status === SubscriptionStatusEnum.Active;
      });
      return { ...user, activeSubscription };
    } catch (error) {
      throw error;
    }
  }

  // logout
  async logout(token: string) {
    if (!token) return null;
    const bearerToken = token?.split(' ')[1] || token;
    token = bearerToken;
    try {
      const decoded = jwt.verify(token, environments.JWT_SECRETS, {
        issuer: tokenOptions.issuer,
        algorithms: [tokenOptions.algorithm as jwt.Algorithm],
        audience: tokenOptions.audience as string,
      }) as JwtPayload;
      if (!decoded) {
        throw new UnauthorizedException('Unable to decode token');
      }

      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const session = await this.cacheManager.get<SessionInfo>(
        decoded.sessionId,
      );
      if (!session || !session?.user) {
        throw new UnauthorizedException('Session expired! login again.');
      }

      await this.cacheManager.del(decoded.sessionId);

      return {
        message: 'Logout successful',
        success: true,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          (error as jwt.JsonWebTokenError)?.message,
        );
      }
      throw error;
    }
  }

  // verify email

  // send forgot password link
  async sendForgotPasswordLink(email: string, request: Request) {
    const origin = request.headers.origin;
    email = email.toLowerCase().trim();
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const resetToken = randomBytes(32).toString('hex');
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { emailToken: resetToken },
      });

      const resetLink = `${origin}/${this.SET_PASSWORD_PATH}?token=${resetToken}&userId=${user.id}`;
      await this.emailService.sendForgotPasswordEmail({
        to: email,
        resetLink,
        name: user.firstName,
      });

      return {
        message: 'Password reset link sent successfully',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
  // reset password

  // decode token
  async decodeToken(token: string): Promise<User | null> {
    if (!token) return null;
    const bearerToken = token?.split(' ')[1] || token;
    token = bearerToken;
    try {
      const decoded = jwt.verify(token, environments.JWT_SECRETS, {
        issuer: tokenOptions.issuer,
        algorithms: [tokenOptions.algorithm as jwt.Algorithm],
        audience: tokenOptions.audience as string,
      }) as JwtPayload;
      if (!decoded) {
        throw new UnauthorizedException('Unable to decode token');
      }

      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const session = await this.cacheManager.get<SessionInfo>(
        decoded.sessionId,
      );
      if (!session || !session?.user) {
        throw new UnauthorizedException('Session expired! login again.');
      }

      // // Extend session TTL and issue a fresh access token with +15 minutes
      // const extendSeconds = 15 * 60; // 15 minutes
      // const refreshedPayload: JwtPayload = {
      //   id: decoded.id,
      //   tokenType: 'access',
      //   sessionId: decoded.sessionId,
      // };

      // jwt.sign(refreshedPayload, environments.JWT_SECRETS, {
      //   ...tokenOptions,
      //   expiresIn: extendSeconds,
      // });

      // await this.cacheManager.set(decoded.sessionId, session, extendSeconds);

      return session.user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(
          (error as jwt.JsonWebTokenError)?.message,
        );
      }
      throw error;
    }
  }

  // generate access and refresh tokens
  private async generateTokens(userId: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const sessionId = randomBytes(16).toString('hex');

    const payload: JwtPayload = {
      id: userId,
      tokenType: 'access',
      sessionId,
    };

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const access_token = jwt.sign(
      payload,
      environments.JWT_SECRETS,
      tokenOptions,
    );

    const refresh_token = jwt.sign(
      { ...payload, tokenType: 'refresh' },
      environments.JWT_SECRETS,
      {
        ...tokenOptions,
        expiresIn: environments.REFRESH_TOKEN_EXPIRY,
      },
    );

    const sessionInfo: SessionInfo = {
      sessionId,
      userId,
      refresh_token,
      user: user,
      createdAt: new Date(),
    };

    await this.cacheManager.set(
      sessionId,
      sessionInfo,
      parseExpiry(environments.REFRESH_TOKEN_EXPIRY),
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
