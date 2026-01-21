import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['home', 'office', 'trip', 'friends', 'other'])
  groupType?: string;

  @IsOptional()
  @IsString()
  iconSeed?: string;

  @IsOptional()
  @IsString()
  @IsIn(['jdenticon'])
  iconProvider?: string;
}
