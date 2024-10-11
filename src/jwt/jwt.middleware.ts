import {
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AUTH_KEYS } from './auth.keys';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly _logger = new Logger(JwtMiddleware.name);

  constructor(private readonly _jwt: JwtService) {}

  async use(req: Request, res: Response, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) throw new ForbiddenException(AUTH_KEYS.INVALID_REQUEST);

    try {
      const decoded: { id: string; iat: string | number } =
        this._jwt.verify(token);

      req['user'] = decoded;

      next();
    } catch (error) {
      this._logger.error(error);
      throw new ForbiddenException(AUTH_KEYS.INVALID_REQUEST);
    }
  }
}
