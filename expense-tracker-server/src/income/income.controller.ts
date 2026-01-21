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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('income')
@Controller('income')
@UseGuards(JwtAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new income' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createIncomeDto: CreateIncomeDto,
  ) {
    return this.incomeService.create(user.userId, createIncomeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all income with pagination, sorting, and filtering',
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: IncomeQueryDto) {
    return this.incomeService.findAll(user.userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get income statistics' })
  getStats(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.incomeService.getStats(user.userId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific income by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.incomeService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomeService.update(user.userId, id, updateIncomeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.incomeService.remove(user.userId, id);
  }
}
