import { IsEmail, IsString } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  purpose: 'registration' | 'login' | 'password_reset';
}
