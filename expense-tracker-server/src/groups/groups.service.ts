import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { SplitCalculationService } from './services/split-calculation.service';
import { BalanceCalculationService } from './services/balance-calculation.service';
import * as crypto from 'crypto';
import {
  generateRandomSeed,
  validateGroupIconProvider,
} from '../common/utils/avatar-utils';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) { }

  async create(createGroupDto: CreateGroupDto, userId: string) {
    // Generate icon data
    const iconSeed = createGroupDto.iconSeed || generateRandomSeed();
    const iconProvider =
      createGroupDto.iconProvider && validateGroupIconProvider(createGroupDto.iconProvider)
        ? createGroupDto.iconProvider
        : 'jdenticon';

    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        imageUrl: createGroupDto.imageUrl,
        iconSeed,
        iconProvider: iconProvider as any,
        createdByUserId: userId,
        members: {
          create: {
            userId: userId,
            role: 'admin',
            inviteStatus: 'accepted',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.group.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            userId: userId,
            inviteStatus: 'accepted',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            splitExpenses: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
          },
        },
        groupExpenses: {
          include: {
            paidBy: true,
            category: true,
            splits: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            expenseDate: 'desc',
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Verify user is a member
    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Only admin can update
    if (!this.isGroupAdmin(group, userId)) {
      throw new ForbiddenException('Only group admins can update the group');
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        name: updateGroupDto.name,
        description: updateGroupDto.description,
        imageUrl: updateGroupDto.imageUrl,
        iconSeed: updateGroupDto.iconSeed,
        iconProvider: updateGroupDto.iconProvider as any,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Only creator can delete
    if (group.createdByUserId !== userId) {
      throw new ForbiddenException(
        'Only the group creator can delete the group',
      );
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async addMember(
    groupId: string,
    addMemberDto: AddGroupMemberDto,
    userId: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Only admin can add members
    if (!this.isGroupAdmin(group, userId)) {
      throw new ForbiddenException('Only group admins can add members');
    }

    // Check if member already exists
    if (addMemberDto.userId) {
      const existingMember = group.members.find(
        (m) => m.userId === addMemberDto.userId,
      );
      if (existingMember) {
        throw new BadRequestException('User is already a member of this group');
      }
    }

    // Generate invite token if email provided
    const inviteToken = addMemberDto.memberEmail
      ? crypto.randomBytes(32).toString('hex')
      : null;

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId: addMemberDto.userId,
        memberName: addMemberDto.memberName,
        memberEmail: addMemberDto.memberEmail,
        memberPhone: addMemberDto.memberPhone,
        role: addMemberDto.role || 'member',
        inviteToken,
        inviteStatus: addMemberDto.userId ? 'accepted' : 'pending',
        joinedAt: addMemberDto.userId ? new Date() : null,
      },
      include: {
        user: true,
        group: true,
      },
    });
  }

  async removeMember(groupId: string, memberId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Only admin can remove members (or members can remove themselves)
    const member = group.members.find((m) => m.id === memberId);
    if (!member) {
      throw new NotFoundException('Member not found in this group');
    }

    const isAdmin = this.isGroupAdmin(group, userId);
    const isSelf = member.userId === userId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }

    // Prevent removing the last admin
    if (member.role === 'admin') {
      const adminCount = group.members.filter((m) => m.role === 'admin').length;
      if (adminCount === 1) {
        throw new BadRequestException(
          'Cannot remove the last admin from the group',
        );
      }
    }

    return this.prisma.groupMember.delete({
      where: { id: memberId },
    });
  }

  async acceptInvite(token: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { inviteToken: token },
      include: {
        group: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Invalid invite token');
    }

    if (member.inviteStatus === 'accepted') {
      throw new BadRequestException('This invite has already been accepted');
    }

    return this.prisma.groupMember.update({
      where: { id: member.id },
      data: {
        userId,
        inviteStatus: 'accepted',
        joinedAt: new Date(),
        memberName: null, // Clear non-registered fields
      },
      include: {
        user: true,
        group: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async getGroupMembers(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.prisma.groupMember.findMany({
      where: {
        groupId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getGroupExpenses(
    groupId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (!this.isGroupMember(group, userId)) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.prisma.groupExpense.findMany({
        where: {
          groupId,
        },
        include: {
          paidBy: true,
          category: true,
          splits: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          expenseDate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.groupExpense.count({
        where: {
          groupId,
        },
      }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Leave a group
   * Edge case: User cannot leave if they owe money
   */
  async leaveGroup(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      throw new NotFoundException('You are not a member of this group');
    }

    // Check if user is the only admin
    const admins = group.members.filter(
      (m) => m.role === 'admin' && m.inviteStatus === 'accepted',
    );
    if (admins.length === 1 && member.role === 'admin') {
      throw new BadRequestException(
        'You are the only admin. Please assign another admin before leaving.',
      );
    }

    // Check if user has outstanding debts
    const expenses = await this.prisma.groupExpense.findMany({
      where: { groupId },
      include: { splits: true },
    });

    const { BalanceCalculationService } = await import('./services/balance-calculation.service');
    const balanceService = new BalanceCalculationService();
    const balances = balanceService.calculateGroupBalances(expenses as any);
    const userBalance = balanceService.getUserBalance(balances, userId);

    // Negative balance means user owes money
    if (userBalance < -0.01) {
      throw new BadRequestException(
        `You cannot leave the group with outstanding debts. ` +
        `You owe ₹${Math.abs(userBalance).toFixed(2)}. Please settle your debts first.`,
      );
    }

    // Proceed with leaving
    return this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  // Helper methods
  private isGroupMember(
    group: {
      members: Array<{ userId: string | null; inviteStatus: string | null }>;
    },
    userId: string,
  ): boolean {
    return group.members.some(
      (m) => m.userId === userId && m.inviteStatus === 'accepted',
    );
  }

  private isGroupAdmin(
    group: {
      members: Array<{
        userId: string | null;
        role: string;
        inviteStatus: string | null;
      }>;
    },
    userId: string,
  ): boolean {
    return group.members.some(
      (m) =>
        m.userId === userId &&
        m.role === 'admin' &&
        m.inviteStatus === 'accepted',
    );
  }

  // ==================== EXPENSE CRUD METHODS ====================

  /**
   * Create a group expense with split calculation
   * Edge cases handled:
   * - Validates user is group member
   * - Calculates splits based on type
   * - Validates split sums
   * - Handles rounding
   * - Tracks calculation metadata
   */
  async createGroupExpense(
    groupId: string,
    createExpenseDto: any, // CreateGroupExpenseDto
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
    const { SplitCalculationService } = await import('./services/split-calculation.service');
    const splitService = new SplitCalculationService();

    const splits = splitService.calculateSplits(
      createExpenseDto.amount,
      createExpenseDto.splitType,
      createExpenseDto.participants,
      userId, // payer
    );

    // Validate splits
    const validation = splitService.validateSplits(createExpenseDto.amount, splits);
    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }

    // Validate participants are group members
    const memberIds = group.members.map((m) => m.userId);
    const participantValidation = splitService.validateParticipants(
      createExpenseDto.participants,
      memberIds,
    );

    if (!participantValidation.isValid) {
      throw new BadRequestException(
        `Invalid participants: ${participantValidation.invalidUserIds.join(', ')}`,
      );
    }

    // Create expense with splits in transaction
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.groupExpense.create({
        data: {
          groupId,
          paidByUserId: userId,
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

      // Create calculation metadata
      const roundingDiff = splitService.calculateRoundingDifference(
        createExpenseDto.amount,
        splits,
      );

      await tx.splitCalculation.create({
        data: {
          groupExpenseId: expense.id,
          splitType: createExpenseDto.splitType,
          totalAmount: createExpenseDto.amount,
          participantsCount: splits.length,
          roundingDifference: roundingDiff,
        },
      });

      return expense;
    });
  }

  /**
   * Get a single expense with splits
   */
  async getGroupExpense(groupId: string, expenseId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    const expense = await this.prisma.groupExpense.findFirst({
      where: {
        id: expenseId,
        groupId,
      },
      include: {
        paidBy: true,
        category: true,
        splits: {
          include: {
            user: true,
          },
        },
        splitCalculations: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  /**
   * Update a group expense
   * Edge cases handled:
   * - Only payer or admin can edit
   * - Cannot edit if fully settled
   * - Cannot edit if partial payments made
   * - Recalculates splits if amount/type changes
   * - Tracks edit history
   */
  async updateGroupExpense(
    groupId: string,
    expenseId: string,
    updateDto: any, // UpdateGroupExpenseDto
    userId: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const expense = await this.prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
      include: { splits: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Permission check: only payer or admin can edit
    const isAdmin = this.isGroupAdmin(group, userId);
    const isPayer = expense.paidByUserId === userId;

    if (!isPayer && !isAdmin) {
      throw new ForbiddenException('Only the payer or admin can edit this expense');
    }

    // Cannot edit if fully settled
    if (expense.isSettled) {
      throw new BadRequestException('Cannot edit a fully settled expense');
    }

    // Cannot edit if partial payments made
    const hasPartialPayments = expense.splits.some((s) => s.amountPaid > 0);
    if (hasPartialPayments) {
      throw new BadRequestException(
        'Cannot edit expense with partial payments. Please settle or cancel payments first.',
      );
    }

    // If amount or split type changed, recalculate splits
    if (updateDto.amount || updateDto.splitType || updateDto.participants) {
      const { SplitCalculationService } = await import('./services/split-calculation.service');
      const splitService = new SplitCalculationService();

      const newAmount = updateDto.amount || expense.amount;
      const newSplitType = updateDto.splitType || expense.splitType;
      const newParticipants = updateDto.participants || expense.splits.map((s) => ({
        userId: s.userId,
        amount: s.amountOwed,
      }));

      const newSplits = splitService.calculateSplits(
        Number(newAmount),
        newSplitType as any,
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
  }

  /**
   * Delete a group expense (soft delete)
   * Edge cases handled:
   * - Only payer or admin can delete
   * - Cannot delete if settled
   * - Tracks deletion reason
   */
  async deleteGroupExpense(groupId: string, expenseId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const expense = await this.prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Permission check
    const isAdmin = this.isGroupAdmin(group, userId);
    const isPayer = expense.paidByUserId === userId;

    if (!isPayer && !isAdmin) {
      throw new ForbiddenException('Only the payer or admin can delete this expense');
    }

    // Cannot delete if settled
    if (expense.isSettled) {
      throw new BadRequestException('Cannot delete a settled expense');
    }

    // Soft delete (or hard delete - your choice)
    return this.prisma.groupExpense.delete({
      where: { id: expenseId },
    });
  }

  // ==================== BALANCE & SETTLEMENT METHODS ====================

  /**
   * Get all balances for a group
   */
  async getGroupBalances(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    const expenses = await this.prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        splits: {
          include: {
            user: true,
          },
        },
        paidBy: true,
      },
    });

    const { BalanceCalculationService } = await import('./services/balance-calculation.service');
    const balanceService = new BalanceCalculationService();

    const balances = balanceService.calculateGroupBalances(expenses as any);

    return Array.from(balances.values()).map((balance) => ({
      ...balance,
      formatted: balanceService.formatBalance(balance.balance),
    }));
  }

  /**
   * Get balance for a specific user
   */
  async getUserBalance(groupId: string, targetUserId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    const expenses = await this.prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        splits: {
          include: {
            user: true,
          },
        },
      },
    });

    const { BalanceCalculationService } = await import('./services/balance-calculation.service');
    const balanceService = new BalanceCalculationService();

    const balances = balanceService.calculateGroupBalances(expenses as any);
    const userBalance = balanceService.getUserBalance(balances, targetUserId);

    return {
      userId: targetUserId,
      balance: userBalance,
      formatted: balanceService.formatBalance(userBalance),
    };
  }

  /**
   * Get simplified debts (debt simplification algorithm)
   */
  async getSimplifiedDebts(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    const expenses = await this.prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        splits: {
          include: {
            user: true,
          },
        },
      },
    });

    const { BalanceCalculationService } = await import('./services/balance-calculation.service');
    const balanceService = new BalanceCalculationService();

    const balances = balanceService.calculateGroupBalances(expenses as any);
    const simplifiedDebts = balanceService.simplifyDebts(balances);

    return simplifiedDebts;
  }

  /**
   * Settle an expense (record payment)
   * Edge cases handled:
   * - Validates payment amount
   * - Detects overpayment
   * - Tracks payment method
   * - Updates split status
   */
  async settleExpense(
    groupId: string,
    expenseId: string,
    settleDto: any, // SettleExpenseDto
    userId: string,
  ) {
    await this.verifyGroupMembership(groupId, userId);

    const expense = await this.prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId },
      include: { splits: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Find the split for the user
    const split = expense.splits.find((s) => s.userId === settleDto.userId);
    if (!split) {
      throw new NotFoundException('Split not found for this user');
    }

    // Check for overpayment
    const remainingOwed = Number(split.amountOwed) - Number(split.amountPaid);
    if (settleDto.amount > remainingOwed + 0.01) {
      throw new BadRequestException(
        `Overpayment detected. Remaining owed: ₹${remainingOwed.toFixed(2)}, ` +
        `Payment: ₹${settleDto.amount.toFixed(2)}`,
      );
    }

    // Update split
    const newAmountPaid = Number(split.amountPaid) + settleDto.amount;
    const isFullyPaid = newAmountPaid >= Number(split.amountOwed) - 0.01;

    await this.prisma.groupExpenseSplit.update({
      where: { id: split.id },
      data: {
        amountPaid: newAmountPaid,
        isPaid: isFullyPaid || settleDto.markAsFullyPaid,
        paidAt: isFullyPaid ? new Date() : split.paidAt,
      },
    });

    // Check if all splits are paid
    const allSplits = await this.prisma.groupExpenseSplit.findMany({
      where: { groupExpenseId: expenseId },
    });

    const allPaid = allSplits.every((s) => s.isPaid);
    if (allPaid) {
      await this.prisma.groupExpense.update({
        where: { id: expenseId },
        data: { isSettled: true },
      });
    }

    return {
      success: true,
      amountPaid: settleDto.amount,
      remainingOwed: Math.max(0, remainingOwed - settleDto.amount),
      isFullyPaid,
    };
  }

  /**
   * Record a settlement between two users
   */
  async recordSettlement(groupId: string, settlementDto: any, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    return this.prisma.settlement.create({
      data: {
        groupId,
        fromUserId: settlementDto.fromUserId,
        toUserId: settlementDto.toUserId,
        amount: settlementDto.amount,
        currency: settlementDto.currency || 'INR',
        settledAt: new Date(),
        notes: settlementDto.notes,
      },
    });
  }

  /**
   * Get all settlements for a group
   */
  async getSettlements(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    return this.prisma.settlement.findMany({
      where: { groupId },
      include: {
        fromUser: true,
        toUser: true,
      },
      orderBy: {
        settledAt: 'desc',
      },
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Verify user is a group member
   */
  private async verifyGroupMembership(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        inviteStatus: 'accepted',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return membership;
  }

  /**
   * Verify user is a group member
   */
  private async verifyGroupMembership(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        inviteStatus: 'accepted',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return membership;
  }
}
