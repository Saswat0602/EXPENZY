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
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';
import { LoanQueryDto } from './dto/loan-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all loans with pagination, sorting, and filtering',
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: LoanQueryDto) {
    return this.loansService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.loansService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLoanDto: UpdateLoanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.update(id, updateLoanDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.loansService.remove(id, user.userId);
  }

  @Post(':id/payments')
  addPayment(
    @Param('id') id: string,
    @Body() createLoanPaymentDto: CreateLoanPaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.addPayment(id, createLoanPaymentDto, user.userId);
  }

  // Note: Invite functionality removed - see loans.service.ts for details
}
