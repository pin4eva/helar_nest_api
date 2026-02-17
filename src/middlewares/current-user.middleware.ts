import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { User } from '../generated/client';
import { AuthService } from 'src/user/auth.service';

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const token = req.headers?.authorization;

    if (!token) {
      return next();
    }
    try {
      const user = await this.authService.decodeToken(token);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error(error?.["message"]);
      return next();
    }
    next();
  }
}
