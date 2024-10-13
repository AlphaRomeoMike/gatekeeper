import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { KEYS } from './auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly _logger = new Logger(JwtGuard.name);

  constructor(private readonly _jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException(KEYS.UNAUTHORIZED);

    try {
      const decoded = await this._jwt.verifyAsync(token);
      request.user = decoded;
      return true;
    } catch (error) {
      this._logger.error(error);
      throw new UnauthorizedException(KEYS.UNAUTHORIZED);
    }
  }
}
