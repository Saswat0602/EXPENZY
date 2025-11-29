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
        tags: createExpenseDto.tags,
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
      where.expenseDate = QueryBuilder.buildDateRangeFilter(
        query.startDate,
        query.endDate,
      );
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    if (query.tags) {
      const tagsArray = query.getTagsArray();
      if (tagsArray) {
        where.tags = QueryBuilder.buildArrayContainsFilter(tagsArray);
      }
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

    // Build orderBy clause
    const allowedSortFields = ['expenseDate', 'amount', 'createdAt', 'updatedAt'];
    const sortBy = query.sortBy && allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'expenseDate';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.expense.count({ where });

    // Get paginated data
    const data = await this.prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      skip: query.skip,
      take: query.take,
    });

    return new PaginatedResponseDto(data, query.page || 1, query.limit || 20, total);
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
        tags: updateExpenseDto.tags,
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
