import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Role } from 'src/role/role.entity';
import { JwtMiddleware } from 'src/jwt/jwt.middleware';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      useFactory: (_config: ConfigService) => ({
        secret: _config.getOrThrow<string>('JWT_SECRET'),
        verifyOptions: {
          maxAge: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class UserModule {
  configure(_consumer: MiddlewareConsumer) {
    _consumer.apply(JwtMiddleware).forRoutes({
      path: '/profile*',
      method: RequestMethod.ALL,
    });
  }
}
