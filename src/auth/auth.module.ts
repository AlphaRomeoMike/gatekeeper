import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, ConfigService, JwtGuard],
  exports: [JwtGuard],
})
export class AuthModule {}
