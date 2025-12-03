import { IsString, IsNotEmpty } from 'class-validator';

export class CategorizeDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
