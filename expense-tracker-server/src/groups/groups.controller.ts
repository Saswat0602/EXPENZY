import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) { }

  @Post()
  create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.create(createGroupDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.groupsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.groupsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.update(id, updateGroupDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.groupsService.remove(id, user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddGroupMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.addMember(id, addMemberDto, user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.groupsService.getGroupMembers(id, user.userId);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.removeMember(id, memberId, user.userId);
  }

  @Get(':id/expenses')
  getGroupExpenses(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.groupsService.getGroupExpenses(id, user.userId, pageNum, limitNum);
  }
}
