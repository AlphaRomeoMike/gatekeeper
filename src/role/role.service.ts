import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ROLE_KEYS } from './role.key';
import { UserFilterDto } from './role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly _repo: Repository<Role>,
    @InjectRepository(User)
    private readonly _user_repo: Repository<User>,
  ) {}

  async assign(user_id: string, role_id: string) {
    const user = await this._user_repo.findOne({
      where: {
        id: user_id,
        role: {
          id: Not(role_id),
        },
      },
    });

    if (!user)
      throw new HttpException(ROLE_KEYS.INVALID_USER, HttpStatus.CONFLICT);

    this._user_repo.update(user.id, {
      role: {
        id: role_id,
      },
    });
  }

  async getUsers(_query: UserFilterDto) {
    const { column, sort, email, from: skip, to: take, name, order } = _query;

    const query = this._user_repo.manager.findAndCount(User, {
      skip: skip,
      take: take,
      order: {
        [column]: order,
      },
      where: {
        role: IsNull(),
      },
    });
  }
}
