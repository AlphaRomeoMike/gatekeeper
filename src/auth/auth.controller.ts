import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupUserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  private readonly _logger = new Logger(AuthController.name);

  constructor(private readonly _service: AuthService) {}

  @Post('/signup')
  async signup(@Body() _user: SignupUserDto) {
    try {
      let user = await this._service.signup(_user);

      if (user?.password) delete user.password;

      return user;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
}
