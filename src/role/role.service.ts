import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Not, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ROLE_KEYS } from './role.key';
import { RolePaginationDto, UserFilterDto } from './role.dto';
import { Role as RoleEnum } from './role.enum';

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

  async getUsers(_query: UserFilterDto, _user: User) {
    const { column, sort, email, from: skip = 0, to: take = 10, name } = _query;

    const { '0': users, '1': count } =
      await this._user_repo.manager.findAndCount(User, {
        skip: skip,
        take: take,
        order: {
          [column]: sort,
        },
        where: {
          ...(name ? { full_name: name } : {}),
          ...(email ? { email } : {}),
          id: Not(_user.id),
        },
      });

    return new RolePaginationDto(
      users,
      count,
      Math.floor(skip / take) + 1,
      take,
    );
  }

  async getRoles() {
    return await this._repo.find();
  }
}
