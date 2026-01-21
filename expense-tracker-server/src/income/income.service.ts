import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { IncomeResponseDto } from './dto/income-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createIncomeDto: CreateIncomeDto,
  ): Promise<IncomeResponseDto> {
    const income = await this.prisma.income.create({
      data: {
        userId,
        source: createIncomeDto.source,
        amount: new Prisma.Decimal(createIncomeDto.amount),
        currency: createIncomeDto.currency || 'USD',
        categoryId: createIncomeDto.categoryId,
        description: createIncomeDto.description,
        incomeDate: new Date(createIncomeDto.incomeDate),
        isRecurring: createIncomeDto.isRecurring || false,
        recurringPatternId: createIncomeDto.recurringPatternId,
        paymentMethod: createIncomeDto.paymentMethod,
        notes: createIncomeDto.notes,
      },
      include: {
        category: true,
        recurringPattern: true,
      },
    });

    return new IncomeResponseDto(income);
  }

  async findAll(userId: string, query: IncomeQueryDto) {
    // Determine pagination mode: cursor or offset
    const useCursor = !!query.cursor;
    const limit = query.limit || (useCursor ? 50 : 20);

    // Build where clause
    const where: Prisma.IncomeWhereInput = {
      userId,
      deletedAt: null,
    };

    // Add cursor for cursor-based pagination
    if (useCursor && query.cursor) {
      const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
      where.id =
        sortOrder === 'desc' ? { lt: query.cursor } : { gt: query.cursor };
    }

    // Add filters
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.startDate || query.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) {
        dateFilter.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        dateFilter.lte = new Date(query.endDate);
      }
      where.incomeDate = dateFilter;
    }

    // Search filter (minimum 2 characters validated by DTO)
    if (query.search) {
      where.OR = [
        { source: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Build sorting
    const sortBy =
      query.sortBy === 'amount' ||
      query.sortBy === 'createdAt' ||
      query.sortBy === 'updatedAt'
        ? query.sortBy
        : 'incomeDate';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.IncomeOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    if (useCursor) {
      // Cursor-based pagination
      const data = await this.prisma.income.findMany({
        where,
        include: {
          category: true,
          recurringPattern: true,
        },
        orderBy,
        take: limit + 1,
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, limit) : data;
      const nextCursor =
        hasMore && items.length > 0 ? items[items.length - 1].id : null;

      return {
        data: items.map((income) => new IncomeResponseDto(income)),
        meta: {
          nextCursor,
          hasMore,
          limit,
        },
      };
    } else {
      // Offset-based pagination (backward compatible)
      const total = await this.prisma.income.count({ where });

      const findOptions: Prisma.IncomeFindManyArgs = {
        where,
        include: {
          category: true,
          recurringPattern: true,
        },
        orderBy,
      };

      if (query.page !== undefined && query.limit !== undefined) {
        findOptions.skip = query.skip;
        findOptions.take = query.take;
      }

      const data = await this.prisma.income.findMany(findOptions);

      return {
        data: data.map((income) => new IncomeResponseDto(income)),
        total,
        page: query.page || 1,
        limit: query.limit || total,
      };
    }
  }

  async findOne(userId: string, id: string): Promise<IncomeResponseDto> {
    const income = await this.prisma.income.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
        recurringPattern: true,
      },
    });

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    return new IncomeResponseDto(income);
  }

  async update(
    userId: string,
    id: string,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<IncomeResponseDto> {
    const existing = await this.prisma.income.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Income not found');
    }

    const income = await this.prisma.income.update({
      where: { id },
      data: {
        ...(updateIncomeDto.source && { source: updateIncomeDto.source }),
        ...(updateIncomeDto.amount !== undefined && {
          amount: new Prisma.Decimal(updateIncomeDto.amount),
        }),
        ...(updateIncomeDto.currency && { currency: updateIncomeDto.currency }),
        ...(updateIncomeDto.categoryId !== undefined && {
          categoryId: updateIncomeDto.categoryId,
        }),
        ...(updateIncomeDto.description !== undefined && {
          description: updateIncomeDto.description,
        }),
        ...(updateIncomeDto.incomeDate && {
          incomeDate: new Date(updateIncomeDto.incomeDate),
        }),
        ...(updateIncomeDto.isRecurring !== undefined && {
          isRecurring: updateIncomeDto.isRecurring,
        }),
        ...(updateIncomeDto.recurringPatternId !== undefined && {
          recurringPatternId: updateIncomeDto.recurringPatternId,
        }),
        ...(updateIncomeDto.paymentMethod !== undefined && {
          paymentMethod: updateIncomeDto.paymentMethod,
        }),
        ...(updateIncomeDto.notes !== undefined && {
          notes: updateIncomeDto.notes,
        }),
      },
      include: {
        category: true,
        recurringPattern: true,
      },
    });

    return new IncomeResponseDto(income);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.income.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Income not found');
    }

    await this.prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Income deleted successfully' };
  }

  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalIncome: string;
    incomeCount: number;
    averageIncome: string;
    byCategory: Array<{
      categoryId: string | null;
      categoryName: string | null;
      total: string;
      count: number;
    }>;
    bySource: Array<{ source: string; total: string; count: number }>;
  }> {
    const where: Prisma.IncomeWhereInput = {
      userId,
      deletedAt: null,
      ...(startDate &&
        endDate && {
          incomeDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const incomes = await this.prisma.income.findMany({
      where,
      include: { category: true },
    });

    const totalIncome = incomes.reduce(
      (sum, income) => sum.add(income.amount),
      new Prisma.Decimal(0),
    );
    const incomeCount = incomes.length;
    const averageIncome =
      incomeCount > 0 ? totalIncome.div(incomeCount) : new Prisma.Decimal(0);

    const byCategory = Object.values(
      incomes.reduce(
        (
          acc: Record<
            string,
            {
              categoryId: string | null;
              categoryName: string | null;
              total: Prisma.Decimal;
              count: number;
            }
          >,
          income,
        ) => {
          const key = income.categoryId || 'uncategorized';
          if (!acc[key]) {
            acc[key] = {
              categoryId: income.categoryId,
              categoryName: income.category?.name || null,
              total: new Prisma.Decimal(0),
              count: 0,
            };
          }
          acc[key].total = acc[key].total.add(income.amount);
          acc[key].count += 1;
          return acc;
        },
        {},
      ),
    ).map((item) => ({ ...item, total: item.total.toString() }));

    const bySource = Object.values(
      incomes.reduce(
        (
          acc: Record<
            string,
            { source: string; total: Prisma.Decimal; count: number }
          >,
          income,
        ) => {
          const key = income.source;
          if (!acc[key]) {
            acc[key] = {
              source: income.source,
              total: new Prisma.Decimal(0),
              count: 0,
            };
          }
          acc[key].total = acc[key].total.add(income.amount);
          acc[key].count += 1;
          return acc;
        },
        {},
      ),
    ).map((item) => ({ ...item, total: item.total.toString() }));

    return {
      totalIncome: totalIncome.toString(),
      incomeCount,
      averageIncome: averageIncome.toString(),
      byCategory,
      bySource,
    };
  }
}
