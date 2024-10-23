import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtGuard } from './jwt.guard';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, JwtModule],
  providers: [AuthService, ConfigService, JwtGuard],
  exports: [JwtGuard],
  controllers: [AuthController],
})
export class AuthModule {}
