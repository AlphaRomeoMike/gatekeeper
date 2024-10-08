import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCreateDto, UserCreateDto } from './user.dto';
import { USER_KEYS } from './user.key';
import { hash, genSalt, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isEmpty } from 'lodash';
import { Role } from 'src/role/role.entity';
import { Role as RoleEnum } from 'src/role/role.enum';

@Injectable()
export class UserService {
  private readonly _logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private readonly _repo: Repository<User>,
    @InjectRepository(Role) private readonly _role_repo: Repository<Role>,
    private readonly _config: ConfigService,
    private readonly _jwt: JwtService,
  ) {}

  async signup(_user: UserCreateDto) {
    const user = await this._repo.findOneBy({ email: _user.email });

    if (user)
      throw new HttpException(USER_KEYS.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);

    const salt = await genSalt();
    const salt_password = await hash(_user.password_hash, salt);

    if (!salt_password) {
      throw new HttpException(
        USER_KEYS.SOMETHING_WRONG,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    _user.password_hash = salt_password;

    const USER = await this._repo.save({
      email: _user.email,
      password_hash: _user.password_hash,
      full_name: _user.full_name,
    });

    if (!USER) {
      throw new HttpException(
        USER_KEYS.INVALID_TRANSACTION,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    delete USER.password_hash;

    return USER;
  }

  async signin(_auth: AuthCreateDto) {
    const _user = await this._repo.findOne({
      where: { email: _auth.email },
      select: ['password_hash', 'id'],
    });

    if (!_user)
      throw new HttpException(USER_KEYS.DOESNT_EXIST, HttpStatus.BAD_REQUEST);

    const password_comparision = await compare(
      _auth.password_hash,
      _user.password_hash,
    );

    if (!password_comparision)
      throw new HttpException(USER_KEYS.DOESNT_EXIST, HttpStatus.BAD_REQUEST);

    const token = await this._jwt.signAsync({
      id: _user.id,
    });

    return token;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleRoles() {
    this._logger.debug(`Running the CRON for updating user roles`);

    const users = await this._repo.find({
      where: {
        role: IsNull(),
      },
    });

    if (!isEmpty(users)) {
      await this.updateRoles(users);
    }
  }

  async updateRoles(_users: User[]) {
    const user_role = await this._role_repo.findOne({
      where: {
        name: RoleEnum.USER,
      },
    });

    const identities = _users.map((user) => user.id);

    this._repo.manager
      .createQueryBuilder()
      .update(User)
      .set({ role: user_role })
      .whereInIds(identities)
      .execute();

    this._logger.warn(`Updated ${_users.length} records!`);
  }

  async validate() {}
}
