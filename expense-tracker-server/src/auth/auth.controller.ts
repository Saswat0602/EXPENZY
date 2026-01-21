import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt-payload.interface';
import type { UserWithoutPassword } from './auth.service';

interface RequestWithUser {
  user: JwtPayload;
}

interface RequestWithGoogleUser {
  user: UserWithoutPassword;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.username,
      registerDto.password,
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    if (verifyOtpDto.purpose === 'registration') {
      return this.authService.verifyRegistrationOtp(
        verifyOtpDto.email,
        verifyOtpDto.code,
      );
    }
    // For other purposes, just verify the OTP
    await this.otpService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.code,
      verifyOtpDto.purpose,
    );
    return { message: 'OTP verified successfully' };
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    await this.otpService.resendOtp(resendOtpDto.email, resendOtpDto.purpose);

    return {
      message: 'OTP has been resent to your email',
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.initiatePasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: RequestWithGoogleUser) {
    return this.authService.login(req.user);
  }
}
