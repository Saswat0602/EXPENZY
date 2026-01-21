import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { EmailService } from '../common/email.service';
import type { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcrypt';

export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  [key: string]: unknown;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      // Check if user is verified
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Please verify your email address before logging in',
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      userId: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(email: string, username: string, password: string) {
    const user = await this.usersService.create({
      email,
      username,
      password,
    });

    // Generate and send OTP for email verification
    const otpCode = await this.otpService.generateOtp(
      email,
      'registration',
      user.id,
    );
    await this.emailService.sendOtpEmail(email, otpCode, 'registration');

    // Auto-link any pending group invitations for this email
    await this.prisma.groupMember.updateMany({
      where: {
        invitedEmail: email,
        inviteStatus: 'pending',
        userId: null,
      },
      data: {
        userId: user.id,
        inviteStatus: 'accepted',
        joinedAt: new Date(),
      },
    });

    return {
      message:
        'Registration successful! Please check your email for verification code.',
      email: user.email,
    };
  }

  async verifyRegistrationOtp(email: string, code: string) {
    // Verify OTP
    await this.otpService.verifyOtp(email, code, 'registration');

    // Update user as verified
    const user = await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return this.login(result);
  }

  async initiatePasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'If the email exists, a password reset code has been sent.',
      };
    }

    const otpCode = await this.otpService.generateOtp(
      email,
      'password_reset',
      user.id,
    );
    await this.emailService.sendOtpEmail(email, otpCode, 'password_reset');

    return {
      message: 'If the email exists, a password reset code has been sent.',
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // Verify OTP
    await this.otpService.verifyOtp(email, code, 'password_reset');

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        lastPasswordChange: new Date(),
      },
    });

    return {
      message:
        'Password reset successful. You can now login with your new password.',
    };
  }
}
