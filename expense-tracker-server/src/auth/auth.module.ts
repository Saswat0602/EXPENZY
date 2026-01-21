import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
    PrismaModule,
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') || 'your-secret-key';
        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
