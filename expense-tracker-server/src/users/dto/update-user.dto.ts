import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';

export class UpdateUserDto {
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
  timezone?: string;

  @IsOptional()
  @IsEnum(['INR', 'USD', 'EUR'])
  defaultCurrency?: 'INR' | 'USD' | 'EUR';
}
