import {
  IsOptional,
  IsEmail,
  IsUUID,
  ValidateIf,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class AddGroupMemberDto {
  // Either userId OR memberEmail required
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ValidateIf((o: AddGroupMemberDto) => !o.userId)
  @IsNotEmpty({
    message: 'Member email is required when userId is not provided',
  })
  @IsEmail()
  memberEmail?: string;

  @IsOptional()
  @IsEnum(['admin', 'member'])
  role?: 'admin' | 'member';
}
