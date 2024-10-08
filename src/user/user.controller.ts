import { Body, Controller, Post } from '@nestjs/common';
import { User } from './user.entity';
import { AuthCreateDto, UserCreateDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly _service: UserService) {}

  @Post('/signup')
  async signup(@Body() _user: UserCreateDto): Promise<User> {
    try {
      const user = await this._service.signup(_user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Post('/signin')
  async signin(
    @Body() _credentials: AuthCreateDto,
  ): Promise<{ token: string }> {
    try {
      const _auth = await this._service.signin(_credentials);
      return {
        token: _auth,
      };
    } catch (error) {
      throw error;
    }
  }
}
