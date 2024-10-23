import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { KEYS, SignupUserDto } from './auth.dto';
import { compare, genSalt, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  constructor(
    private readonly _config: ConfigService,
    @InjectRepository(User) private readonly _repo: Repository<User>,
    private readonly _jwt: JwtService,
  ) {}

  async signup(_user: SignupUserDto) {
    const exists = await this.userExists(_user.email);

    if (exists) throw new ConflictException(KEYS.ALREADYEXISTS);

    const SALT = await genSalt(12);

    _user.password = await hash(_user.password, SALT);

    return await this._repo.save(_user);
  }

  async userExists(_email: string) {
    return await this._repo.exists({
      where: {
        email: _email,
      },
    });
  }

  async login(_credentials: Omit<SignupUserDto, 'name'>) {
    this._logger.debug(`Trying to login user: ${_credentials.email}`);

    const exist = await this.userExists(_credentials.email);

    if (!exist) throw new NotFoundException(KEYS.NOTFOUND);

    let user = await this._repo.findOne({
      where: {
        email: _credentials.email,
      },
      select: ['id', 'password'],
    });

    if (!user || !(await compare(_credentials.password, user.password)))
      throw new NotFoundException(KEYS.NOTFOUND);

    let token = await this._jwt.signAsync(
      {
        id: user.id,
      },
      {
        secret: this._config.get('JWT_SECRET'),
      },
    );

    return token;
  }
}
