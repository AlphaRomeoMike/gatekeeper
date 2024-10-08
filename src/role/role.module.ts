import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { User } from 'src/user/user.entity';

@Module({
  providers: [RoleService],
  controllers: [RoleController],
  imports: [TypeOrmModule.forFeature([Role, User])],
})
export class RoleModule {}
