import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  code: string;

  @IsString()
  purpose: 'registration' | 'login' | 'password_reset';
}
