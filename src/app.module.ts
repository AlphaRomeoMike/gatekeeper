import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from './config/ormconfig';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(configuration),
    ScheduleModule.forRoot(),
    AuthModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
