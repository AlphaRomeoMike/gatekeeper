import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from './config/ormconfig';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(configuration),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => ({
        secret: _config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: _config.getOrThrow<string>('JWT_EXPIRATION'),
          issuer: _config.getOrThrow<string>('JWT_ISSUER'),
        },
        verifyOptions: {
          issuer: _config.getOrThrow<string>('JWT_ISSUER'),
        },
      }),
      imports: [ConfigModule],
    }),
  ],
})
export class AppModule {}
