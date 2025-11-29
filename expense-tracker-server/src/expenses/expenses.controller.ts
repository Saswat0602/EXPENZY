import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.expensesService.create(createExpenseDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with pagination, sorting, and filtering' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExpenseQueryDto,
  ) {
    return this.expensesService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.expensesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.expensesService.update(id, updateExpenseDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.expensesService.remove(id, user.userId);
  }
}
