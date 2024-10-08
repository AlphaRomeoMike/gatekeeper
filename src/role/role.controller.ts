import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Roles } from './role.decorator';
import { Role } from './role.enum';
import { RoleAssignDto } from './role.dto';
import { RoleGuard } from './role.guard';

@Controller('roles')
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
  getUsers() {
    try {
      return this._service.getUsers(_query);
    } catch (error) {
      throw error;
    }
  }
}
