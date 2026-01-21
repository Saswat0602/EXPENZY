import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Recurring Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/recurring')
export class RecurringExpensesController {
  constructor(
    private readonly recurringExpensesService: RecurringExpensesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recurring expense pattern' })
  create(
    @Body() createDto: CreateRecurringExpenseDto,
    @Request() req: RequestWithUser,
  ) {
    return this.recurringExpensesService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recurring expense patterns' })
  findAll(@Request() req: RequestWithUser) {
    return this.recurringExpensesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific recurring expense pattern' })
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recurringExpensesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring expense pattern' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecurringExpenseDto,
    @Request() req: RequestWithUser,
  ) {
    return this.recurringExpensesService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring expense pattern' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.recurringExpensesService.remove(id, req.user.userId);
  }
}
