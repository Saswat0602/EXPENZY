import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users endpoint removed for security reasons
  // Users should register via POST /auth/register instead
  // This endpoint was unprotected and duplicated registration functionality

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  removeProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.remove(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-account')
  deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.userId, deleteAccountDto);
  }
}
