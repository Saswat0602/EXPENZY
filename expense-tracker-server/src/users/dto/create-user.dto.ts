import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  avatarSeed?: string;

  @IsOptional()
  @IsString()
  @IsIn(['adventurer', 'adventurer-neutral', 'thumbs', 'fun-emoji'])
  avatarStyle?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
