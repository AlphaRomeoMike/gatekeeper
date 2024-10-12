import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AUTH_KEYS } from 'src/jwt/auth.keys';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly _logger = new Logger(RoleGuard.name);

  constructor(
    private readonly _reflector: Reflector,
    @InjectRepository(User) private readonly _repo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this._reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user_id = request.user?.id;

    if (!user_id) {
      throw new UnauthorizedException(AUTH_KEYS.INVALID_REQUEST);
    }

    const user = await this._repo.findOne({
      where: {
        id: user_id,
      },
    });

    return !!requiredRoles.includes(user?.role?.name);
  }
}
