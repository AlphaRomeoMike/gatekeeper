import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Roles } from './role.decorator';
import { Role } from './role.enum';
import { RoleAssignDto, UserFilterDto } from './role.dto';
import { RoleGuard } from './role.guard';
import { JwtMiddleware } from 'src/jwt/jwt.middleware';

@Controller('roles')
@UseGuards(JwtMiddleware)
@UseGuards(RoleGuard)
export class RoleController {
  constructor(private readonly _service: RoleService) {}

  @Post('/assign')
  @Roles(Role.ADMIN)
  assign(@Body() _object: RoleAssignDto) {
    try {
      const { role_id, user_id } = _object;
      return this._service.assign(user_id, role_id);
    } catch (error) {
      throw error;
    }
  }

  @Get('/assign')
  @Roles(Role.ADMIN)
  getUsers(@Query() _query: UserFilterDto, @Request() _req) {
    try {
      return this._service.getUsers(_query, _req?.user);
    } catch (error) {
      throw error;
    }
  }

  @Get('/')
  @Roles(Role.ADMIN)
  getRoles() {
    try {
      return this._service.getRoles();
    } catch (error) {
      throw error;
    }
  }
}
