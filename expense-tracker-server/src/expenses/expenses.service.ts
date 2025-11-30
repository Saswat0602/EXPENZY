import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { QueryBuilder } from '../common/utils/query-builder.util';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    return this.prisma.expense.create({
      data: {
        user: { connect: { id: userId } },
        category: createExpenseDto.categoryId
          ? { connect: { id: createExpenseDto.categoryId } }
          : undefined,
        amount: createExpenseDto.amount,
        currency: createExpenseDto.currency || 'USD',
        description: createExpenseDto.description,
        expenseDate: new Date(createExpenseDto.expenseDate),
        paymentMethod: createExpenseDto.paymentMethod,
        receiptUrl: createExpenseDto.receiptUrl,
        notes: createExpenseDto.notes,
        locationLat: createExpenseDto.locationLat,
        locationLng: createExpenseDto.locationLng,
        locationName: createExpenseDto.locationName,
      },
    });
  }

  async findAll(userId: string, query: ExpenseQueryDto) {
    // Build where clause
    const where: Prisma.ExpenseWhereInput = {
      userId,
      deletedAt: null,
    };

    // Add filters
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      where.amount = QueryBuilder.buildNumberRangeFilter(
        query.minAmount,
        query.maxAmount,
      );
    }

    if (query.startDate || query.endDate) {
      const dateFilter = QueryBuilder.buildDateRangeFilter(
        query.startDate,
        query.endDate,
      );
      console.log('Date filter:', {
        startDate: query.startDate,
        endDate: query.endDate,
        filter: dateFilter,
      });
      where.expenseDate = dateFilter;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    if (query.search) {
      const searchFilter = QueryBuilder.buildTextSearchFilter(query.search, [
        'description',
        'notes',
      ]);
      if (searchFilter) {
        Object.assign(where, searchFilter);
      }
    }

    // Build sorting
    const sortBy =
      query.sortBy === 'amount' ||
        query.sortBy === 'createdAt' ||
        query.sortBy === 'updatedAt'
        ? query.sortBy
        : 'expenseDate';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.expense.count({ where });
    console.log('Total expenses found:', total, 'Where clause:', JSON.stringify(where, null, 2));

    // Build find options
    const findOptions: Prisma.ExpenseFindManyArgs = {
      where,
      include: {
        category: true,
      },
      orderBy,
    };

    // Only apply pagination if page and limit are provided
    if (query.page !== undefined && query.limit !== undefined) {
      findOptions.skip = query.skip;
      findOptions.take = query.take;
    }

    // Get data (paginated or all)
    const data = await this.prisma.expense.findMany(findOptions);

    return new PaginatedResponseDto(
      data,
      query.page || 1,
      query.limit || total, // If no limit, use total count
      total,
    );
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
      },
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    // Verify ownership
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this expense',
      );
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        amount: updateExpenseDto.amount,
        currency: updateExpenseDto.currency,
        description: updateExpenseDto.description,
        expenseDate: updateExpenseDto.expenseDate
          ? new Date(updateExpenseDto.expenseDate)
          : undefined,
        paymentMethod: updateExpenseDto.paymentMethod,
        receiptUrl: updateExpenseDto.receiptUrl,
        notes: updateExpenseDto.notes,
        locationLat: updateExpenseDto.locationLat,
        locationLng: updateExpenseDto.locationLng,
        locationName: updateExpenseDto.locationName,
        category: updateExpenseDto.categoryId
          ? { connect: { id: updateExpenseDto.categoryId } }
          : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verify ownership
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this expense',
      );
    }

    // Soft delete
    return this.prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
