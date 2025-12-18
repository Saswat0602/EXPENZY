import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupExpenseDto } from '../dto/create-group-expense.dto';
import { UpdateGroupExpenseDto } from '../dto/update-group-expense.dto';
import { SettleExpenseDto } from '../dto/settle-expense.dto';
import { SplitCalculationService } from './split-calculation.service';
import { GroupCacheService } from './group-cache.service';

@Injectable()
export class GroupExpenseService {
  constructor(
    private prisma: PrismaService,
    private splitCalculationService: SplitCalculationService,
    private cacheService: GroupCacheService,
  ) {}

  /**
   * Create a group expense
   */
  async createExpense(
    groupId: string,
    createExpenseDto: CreateGroupExpenseDto,
    userId: string,
  ) {
    // Verify user is member
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some(
      (m) => m.userId === userId && m.inviteStatus === 'accepted',
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Use split calculation service
    const splitService = this.splitCalculationService;

    const splits = splitService.calculateSplits(
      createExpenseDto.amount,
      createExpenseDto.splitType,
      createExpenseDto.participants,
      userId, // payer
    );

    // Validate splits
    const validation = splitService.validateSplits(
      createExpenseDto.amount,
      splits,
    );
    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    // Validate participants are group members
    const memberIds = group.members
      .map((m) => m.userId)
      .filter((id): id is string => id !== null);
    const participantValidation =
      this.splitCalculationService.validateParticipants(
        createExpenseDto.participants,
        memberIds,
      );

    if (!participantValidation.isValid) {
      throw new BadRequestException(
        `Invalid participants: ${participantValidation.invalidUserIds.join(', ')}`,
      );
    }

    // Create expense with splits in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const expense = await tx.groupExpense.create({
        data: {
          groupId,
          paidByUserId: createExpenseDto.paidByUserId || userId,
          amount: createExpenseDto.amount,
          currency: createExpenseDto.currency || 'INR',
          description: createExpenseDto.description,
          expenseDate: createExpenseDto.expenseDate || new Date(),
          notes: createExpenseDto.notes,
          categoryId: createExpenseDto.categoryId,
          splitType: createExpenseDto.splitType,
          splitValidationStatus: 'valid',
          hasAdjustments: splits.some((s) => s.isRoundingAdjustment),
        },
        include: {
          splits: true,
          paidBy: true,
          category: true,
        },
      });

      // Create splits
      await tx.groupExpenseSplit.createMany({
        data: splits.map((split) => ({
          groupExpenseId: expense.id,
          userId: split.userId,
          amountOwed: split.amountOwed,
          percentage: split.percentage,
          calculatedAmount: split.calculatedAmount,
          adjustmentAmount: split.adjustmentAmount,
          isRoundingAdjustment: split.isRoundingAdjustment,
        })),
      });

      // Fetch the expense again with splits to return in response
      const expenseWithSplits = await tx.groupExpense.findUnique({
        where: { id: expense.id },
        include: {
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          paidBy: true,
          category: true,
          // splitCalculations removed - model deleted
        },
      });

      return expenseWithSplits;
    });

    // Invalidate caches after creating expense
    this.cacheService.invalidateGroupCaches(groupId);
    return result;
  }

  /**
   * Update a group expense
   */
  async updateExpense(
    groupId: string,
    expenseId: string,
    updateDto: UpdateGroupExpenseDto,
    userId: string,
    isGroupAdmin: boolean,
  ) {
    try {
      const expense = await this.prisma.groupExpense.findFirst({
        where: { id: expenseId, groupId },
        include: { splits: true },
      });

      if (!expense) {
        throw new NotFoundException('Expense not found');
      }

      // Permission check: only payer or admin can edit
      const isPayer = expense.paidByUserId === userId;

      if (!isPayer && !isGroupAdmin) {
        throw new ForbiddenException(
          'Only the payer or admin can edit this expense',
        );
      }

      // Cannot edit if fully settled
      if (expense.isSettled) {
        throw new BadRequestException('Cannot edit a fully settled expense');
      }

      // Cannot edit if partial payments made
      const hasPartialPayments = expense.splits.some(
        (s) => Number(s.amountPaid) > 0,
      );
      if (hasPartialPayments) {
        throw new BadRequestException(
          'Cannot edit expense with partial payments. Please settle or cancel payments first.',
        );
      }

      // If amount or split type changed, recalculate splits
      if (updateDto.amount || updateDto.splitType || updateDto.participants) {
        const splitService = this.splitCalculationService;

        const newAmount = updateDto.amount || expense.amount;
        const newSplitType = (updateDto.splitType || expense.splitType) as
          | 'equal'
          | 'exact'
          | 'percentage'
          | 'shares';
        const newParticipants =
          updateDto.participants ||
          expense.splits
            .filter((s) => s.userId !== null)
            .map((s) => ({
              userId: s.userId as string,
              amount: Number(s.amountOwed),
            }));

        const newSplits = splitService.calculateSplits(
          Number(newAmount),
          newSplitType,
          newParticipants,
          expense.paidByUserId!,
        );

        // Update in transaction
        return this.prisma.$transaction(async (tx) => {
          // Delete old splits
          await tx.groupExpenseSplit.deleteMany({
            where: { groupExpenseId: expenseId },
          });

          // Update expense
          const updated = await tx.groupExpense.update({
            where: { id: expenseId },
            data: {
              amount: newAmount,
              splitType: newSplitType,
              description: updateDto.description,
              notes: updateDto.notes,
              categoryId: updateDto.categoryId,
              expenseDate: updateDto.expenseDate,
            },
            include: {
              splits: true,
              paidBy: true,
              category: true,
            },
          });

          // Create new splits
          await tx.groupExpenseSplit.createMany({
            data: newSplits.map((split) => ({
              groupExpenseId: expenseId,
              userId: split.userId,
              amountOwed: split.amountOwed,
              percentage: split.percentage,
              calculatedAmount: split.calculatedAmount,
              adjustmentAmount: split.adjustmentAmount,
              isRoundingAdjustment: split.isRoundingAdjustment,
            })),
          });

          return updated;
        });
      }

      // Simple update without split recalculation
      return this.prisma.groupExpense.update({
        where: { id: expenseId },
        data: {
          description: updateDto.description,
          notes: updateDto.notes,
          categoryId: updateDto.categoryId,
          expenseDate: updateDto.expenseDate,
        },
        include: {
          splits: true,
          paidBy: true,
          category: true,
        },
      });
    } finally {
      // Invalidate caches after updating expense
      this.cacheService.invalidateGroupCaches(groupId);
    }
  }

  /**
   * Delete a group expense
   */
  async deleteExpense(
    groupId: string,
    expenseId: string,
    userId: string,
    isGroupAdmin: boolean,
  ) {
    const expense = await this.prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Permission check: only payer or admin can delete
    const isPayer = expense.paidByUserId === userId;

    if (!isPayer && !isGroupAdmin) {
      throw new ForbiddenException(
        'Only the payer or admin can delete this expense',
      );
    }

    // Cannot delete if settled
    if (expense.isSettled) {
      throw new BadRequestException('Cannot delete a settled expense');
    }

    // Soft delete (or hard delete - your choice)
    const deleted = await this.prisma.groupExpense.delete({
      where: { id: expenseId },
    });

    // Invalidate caches after deleting expense
    this.cacheService.invalidateGroupCaches(groupId);

    return deleted;
  }

  /**
   * Settle an expense
   */
  async settleExpense(
    groupId: string,
    expenseId: string,
    settleDto: SettleExpenseDto,
  ) {
    const expense = await this.prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
      include: { splits: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const userSplit = expense.splits.find((s) => s.userId === settleDto.userId);

    if (!userSplit) {
      throw new BadRequestException('User is not part of this expense');
    }

    // Update the split payment
    const updatedSplit = await this.prisma.groupExpenseSplit.update({
      where: { id: userSplit.id },
      data: {
        amountPaid: settleDto.amount,
        isPaid:
          settleDto.markAsFullyPaid ||
          Number(userSplit.amountOwed) <= settleDto.amount,
        paidAt: new Date(),
      },
    });

    // Check if all splits are paid
    const allSplits = await this.prisma.groupExpenseSplit.findMany({
      where: { groupExpenseId: expenseId },
    });

    const allPaid = allSplits.every((s) => s.isPaid);

    // Update expense settlement status
    if (allPaid) {
      await this.prisma.groupExpense.update({
        where: { id: expenseId },
        data: { isSettled: true },
      });
    }

    // Invalidate caches
    this.cacheService.invalidateGroupCaches(groupId);

    return updatedSplit;
  }
}
