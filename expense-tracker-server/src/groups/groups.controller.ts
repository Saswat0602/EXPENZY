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
import { CreateGroupExpenseDto } from './dto/create-group-expense.dto';
import { UpdateGroupExpenseDto } from './dto/update-group-expense.dto';
import { SettleExpenseDto } from './dto/settle-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) { }

  // ==================== GROUP CRUD ====================

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

  // ==================== MEMBER MANAGEMENT ====================

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

  @Post(':id/leave')
  leaveGroup(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.groupsService.leaveGroup(id, user.userId);
  }

  // ==================== EXPENSE CRUD ====================

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

  @Post(':id/expenses')
  createExpense(
    @Param('id') id: string,
    @Body() createExpenseDto: CreateGroupExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.createGroupExpense(id, createExpenseDto, user.userId);
  }

  @Get(':id/expenses/:expenseId')
  getExpense(
    @Param('id') id: string,
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.getGroupExpense(id, expenseId, user.userId);
  }

  @Patch(':id/expenses/:expenseId')
  updateExpense(
    @Param('id') id: string,
    @Param('expenseId') expenseId: string,
    @Body() updateExpenseDto: UpdateGroupExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.updateGroupExpense(id, expenseId, updateExpenseDto, user.userId);
  }

  @Delete(':id/expenses/:expenseId')
  deleteExpense(
    @Param('id') id: string,
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.deleteGroupExpense(id, expenseId, user.userId);
  }

  // ==================== BALANCE & SETTLEMENTS ====================

  @Get(':id/balances')
  getGroupBalances(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.getGroupBalances(id, user.userId);
  }

  @Get(':id/balances/user/:userId')
  getUserBalance(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.getUserBalance(id, targetUserId, user.userId);
  }

  @Get(':id/balances/simplified')
  getSimplifiedDebts(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.getSimplifiedDebts(id, user.userId);
  }

  @Post(':id/expenses/:expenseId/settle')
  settleExpense(
    @Param('id') id: string,
    @Param('expenseId') expenseId: string,
    @Body() settleDto: SettleExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.settleExpense(id, expenseId, settleDto, user.userId);
  }

  @Post(':id/settlements')
  recordSettlement(
    @Param('id') id: string,
    @Body() settlementDto: any, // TODO: Create DTO
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.recordSettlement(id, settlementDto, user.userId);
  }

  @Get(':id/settlements')
  getSettlements(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.groupsService.getSettlements(id, user.userId);
  }
}
