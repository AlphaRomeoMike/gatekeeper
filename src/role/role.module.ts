import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { User } from 'src/user/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtMiddleware } from 'src/jwt/jwt.middleware';

@Module({
  providers: [RoleService, JwtService],
  controllers: [RoleController],
  imports: [
    TypeOrmModule.forFeature([Role, User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => ({
        secret: _config.get<string>('JWT_SECRET'),
        verifyOptions: {
          maxAge: '1h',
        },
      }),
    }),
  ],
})
export class RoleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/roles/*',
      method: RequestMethod.ALL,
    });
  }
}
