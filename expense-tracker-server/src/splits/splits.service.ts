import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, SplitExpense } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSplitExpenseDto } from './dto/create-split-expense.dto';
import { UpdateSplitExpenseDto } from './dto/update-split-expense.dto';
import { SplitQueryDto } from './dto/split-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { QueryBuilder } from '../common/utils/query-builder.util';

@Injectable()
export class SplitsService {
  constructor(private prisma: PrismaService) {}

  async create(createSplitExpenseDto: CreateSplitExpenseDto, userId: string) {
    const { participants, ...splitData } = createSplitExpenseDto;

    // Validate participants
    if (!participants || participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Calculate total amount owed
    const totalOwed = participants.reduce(
      (sum, p) => sum + Number(p.amountOwed),
      0,
    );

    if (Math.abs(totalOwed - Number(splitData.totalAmount)) > 0.01) {
      throw new BadRequestException(
        'Sum of participant amounts must equal total amount',
      );
    }

    return this.prisma.splitExpense.create({
      data: {
        expenseId: splitData.expenseId!,
        totalAmount: splitData.totalAmount,
        currency: splitData.currency || 'USD',
        splitType: splitData.splitType,
        description: splitData.description,
        paidByUserId: userId,
        participants: {
          create: participants.map((p) => ({
            user: { connect: { id: p.userId! } },
            amountOwed: p.amountOwed!,
            percentage: p.percentage,
            shares: p.shares,
          })),
        },
      },
      include: {
        paidByUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        expense: true,
      },
    });
  }

  async findAll(userId: string, query: SplitQueryDto) {
    // Build where clause - user is either payer or participant
    const where: Prisma.SplitExpenseWhereInput = {
      OR: [
        { paidByUserId: userId },
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    };

    // Add filters
    if (query.isSettled !== undefined) {
      where.isSettled = query.isSettled;
    }

    if (query.splitType) {
      where.splitType = query.splitType;
    }

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      where.totalAmount = QueryBuilder.buildNumberRangeFilter(
        query.minAmount,
        query.maxAmount,
      );
    }

    if (query.search) {
      const searchFilter = QueryBuilder.buildTextSearchFilter(query.search, [
        'description',
      ]);
      if (searchFilter) {
        Object.assign(where, searchFilter);
      }
    }

    // Build orderBy clause
    const allowedSortFields = [
      'createdAt',
      'totalAmount',
      'isSettled',
      'updatedAt',
    ];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.SplitExpenseOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.splitExpense.count({ where });

    // Get paginated data with optimized includes
    const data = await this.prisma.splitExpense.findMany({
      where,
      select: {
        id: true,
        expenseId: true,
        totalAmount: true,
        currency: true,
        splitType: true,
        description: true,
        isSettled: true,
        settledAt: true,
        createdAt: true,
        updatedAt: true,
        paidByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        participants: {
          select: {
            id: true,
            amountOwed: true,
            amountPaid: true,
            percentage: true,
            shares: true,
            isSettled: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy,
      skip: query.skip,
      take: query.take,
    });

    return new PaginatedResponseDto(
      data,
      query.page || 1,
      query.limit || 20,
      total,
    );
  }

  async findOne(id: string, userId: string) {
    const split = await this.prisma.splitExpense.findUnique({
      where: { id },
      include: {
        expense: true,
        paidByUser: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!split) {
      throw new NotFoundException(`Split expense with ID ${id} not found`);
    }

    // Verify access
    if (!this.hasAccessToSplit(split, userId)) {
      throw new ForbiddenException(
        'You do not have permission to access this split expense',
      );
    }

    return split;
  }

  async update(
    id: string,
    updateSplitExpenseDto: UpdateSplitExpenseDto,
    userId: string,
  ) {
    const split = await this.prisma.splitExpense.findUnique({
      where: { id },
    });

    if (!split) {
      throw new NotFoundException(`Split expense with ID ${id} not found`);
    }

    // Only payer can update
    if (split.paidByUserId !== userId) {
      throw new ForbiddenException(
        'Only the person who paid can update this split expense',
      );
    }

    return this.prisma.splitExpense.update({
      where: { id },
      data: {
        description: updateSplitExpenseDto.description,
        isSettled: updateSplitExpenseDto.isSettled,
        settledAt: updateSplitExpenseDto.isSettled ? new Date() : null,
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const split = await this.prisma.splitExpense.findUnique({
      where: { id },
    });

    if (!split) {
      throw new NotFoundException(`Split expense with ID ${id} not found`);
    }

    // Only payer can delete
    if (split.paidByUserId !== userId) {
      throw new ForbiddenException(
        'Only the person who paid can delete this split expense',
      );
    }

    return this.prisma.splitExpense.delete({
      where: { id },
    });
  }

  async settleParticipant(
    splitId: string,
    participantUserId: string,
    userId: string,
  ) {
    // Find the participant
    const participant = await this.prisma.splitParticipant.findFirst({
      where: {
        splitExpenseId: splitId,
        userId: participantUserId,
      },
      include: {
        splitExpense: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this split');
    }

    // Only the participant themselves can settle
    if (participantUserId !== userId) {
      throw new ForbiddenException(
        'You can only settle your own participation',
      );
    }

    if (participant.isSettled) {
      throw new BadRequestException('This participation is already settled');
    }

    // Update participant
    const updatedParticipant = await this.prisma.splitParticipant.update({
      where: { id: participant.id },
      data: {
        amountPaid: participant.amountOwed,
        isSettled: true,
        settledAt: new Date(),
      },
    });

    // Check if all participants are settled
    const allParticipants = await this.prisma.splitParticipant.findMany({
      where: { splitExpenseId: splitId },
    });

    const allSettled = allParticipants.every((p) => p.isSettled);

    if (allSettled) {
      await this.prisma.splitExpense.update({
        where: { id: splitId },
        data: {
          isSettled: true,
          settledAt: new Date(),
        },
      });
    }

    return updatedParticipant;
  }

  // Helper methods
  private validateSplitTotals(dto: CreateSplitExpenseDto) {
    const { splitType, totalAmount, participants } = dto;

    if (splitType === 'percentage') {
      const totalPercentage = participants.reduce(
        (sum, p) => sum + (p.percentage || 0),
        0,
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException('Percentages must add up to 100%');
      }
    }

    if (splitType === 'exact') {
      const totalOwed = participants.reduce(
        (sum, p) => sum + (p.amountOwed || 0),
        0,
      );
      if (Math.abs(totalOwed - totalAmount) > 0.01) {
        throw new BadRequestException(
          'Sum of exact amounts must equal total amount',
        );
      }
    }
  }

  private calculateParticipantAmounts(dto: CreateSplitExpenseDto) {
    const { splitType, totalAmount, participants } = dto;

    return participants.map((p) => {
      let amountOwed = p.amountOwed || 0;

      if (splitType === 'equal') {
        amountOwed = totalAmount / participants.length;
      } else if (splitType === 'percentage' && p.percentage) {
        amountOwed = (totalAmount * p.percentage) / 100;
      } else if (splitType === 'shares' && p.shares) {
        const totalShares = participants.reduce(
          (sum, part) => sum + (part.shares || 0),
          0,
        );
        amountOwed = (totalAmount * p.shares) / totalShares;
      }

      return {
        ...p,
        amountOwed,
      };
    });
  }

  private hasAccessToSplit(
    split: SplitExpense & { participants: { userId: string | null }[] },
    userId: string,
  ): boolean {
    return (
      split.paidByUserId === userId ||
      split.participants.some((p) => p.userId === userId)
    );
  }
}
