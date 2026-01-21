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
import { CreateLoanFromGroupDto } from './dto/create-loan-from-group.dto';
import { LoanAdjustmentDto } from './dto/loan-adjustment.dto';
import { LoanAdjustmentService } from './services/loan-adjustment.service';

@ApiTags('loans')
@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly loanAdjustmentService: LoanAdjustmentService,
  ) {}

  @Get('consolidated')
  @ApiOperation({
    summary: 'Get consolidated view of all loans and group debts',
  })
  getConsolidatedLoans(@CurrentUser() user: JwtPayload) {
    return this.loansService.getConsolidatedLoans(user.userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get loan statistics' })
  getStatistics(@CurrentUser() user: JwtPayload) {
    return this.loansService.getLoanStatistics(user.userId);
  }

  @Get('group-balances')
  @ApiOperation({ summary: 'Get all group-derived balances' })
  getGroupBalances(@CurrentUser() user: JwtPayload) {
    return this.loansService.getGroupDerivedLoans(user.userId);
  }

  @Get('person/:personId')
  @ApiOperation({
    summary: 'Get paginated loans with a specific person',
  })
  getPersonLoans(
    @Param('personId') personId: string,
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loansService.getPersonLoansPaginated(
      user.userId,
      personId,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('transactions/:otherUserId')
  @ApiOperation({
    summary: 'Get all transactions between current user and another user',
  })
  getTransactionsBetweenUsers(
    @Param('otherUserId') otherUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.getTransactionsBetweenUsers(
      user.userId,
      otherUserId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Post('from-group')
  @ApiOperation({ summary: 'Create loan from group balance' })
  createFromGroup(
    @Body() dto: CreateLoanFromGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loansService.createLoanFromGroupBalance(
      dto.groupId,
      user.userId, // Current user is the lender
      dto.borrowerUserId,
      dto.amount,
      dto.description,
      dto.dueDate,
    );
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

  @Get(':id/adjustments')
  @ApiOperation({ summary: 'Get adjustment history for a loan' })
  getAdjustments(@Param('id') id: string) {
    return this.loanAdjustmentService.getAdjustments(id);
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

  @Post(':id/adjustments')
  @ApiOperation({ summary: 'Add payment or adjustment to a loan' })
  addAdjustment(
    @Param('id') id: string,
    @Body() adjustmentDto: LoanAdjustmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.loanAdjustmentService.addAdjustment(
      id,
      adjustmentDto,
      user.userId,
    );
  }

  // Note: Invite functionality removed - see loans.service.ts for details
}
