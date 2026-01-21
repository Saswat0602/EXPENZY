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
import { CreateGroupExpenseDto } from './dto/create-group-expense.dto';
import { UpdateGroupExpenseDto } from './dto/update-group-expense.dto';
import { SettleExpenseDto } from './dto/settle-expense.dto';
import { RecordSettlementDto } from './dto/record-settlement.dto';
import {
  BalanceCalculationService,
  GroupExpenseWithSplits,
} from './services/balance-calculation.service';
import { DebtSettlementService } from './services/debt-settlement.service';
import { GroupCacheService } from './services/group-cache.service';
import { GroupExpenseService } from './services/group-expense.service';
import { GroupStatisticsService } from './services/group-statistics.service';
import { EmailService } from '../common/email.service';
import * as crypto from 'crypto';
import {
  generateRandomSeed,
  validateGroupIconProvider,
} from '../common/utils/avatar-utils';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private balanceCalculationService: BalanceCalculationService,
    private debtSettlementService: DebtSettlementService,
    private cacheService: GroupCacheService,
    private expenseService: GroupExpenseService,
    private statisticsService: GroupStatisticsService,
    private emailService: EmailService,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    // Generate icon data
    const iconSeed = createGroupDto.iconSeed || generateRandomSeed();
    const iconProvider =
      createGroupDto.iconProvider &&
      validateGroupIconProvider(createGroupDto.iconProvider)
        ? (createGroupDto.iconProvider as 'jdenticon')
        : 'jdenticon';

    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        imageUrl: createGroupDto.imageUrl,
        iconSeed,
        iconProvider,
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
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                avatarSeed: true,
                avatarStyle: true,
                avatarUrl: true,
              },
            },
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
        createdBy: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            avatarSeed: true,
            avatarStyle: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                avatarSeed: true,
                avatarStyle: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            groupExpenses: true,
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
        iconProvider: updateGroupDto.iconProvider
          ? (updateGroupDto.iconProvider as 'jdenticon')
          : undefined,
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
        createdBy: true,
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

    // Check if email is already invited
    if (addMemberDto.memberEmail) {
      // Check if user with this email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: addMemberDto.memberEmail },
      });

      if (existingUser) {
        // Check if they're already a member
        const existingMember = group.members.find(
          (m) => m.userId === existingUser.id,
        );
        if (existingMember) {
          throw new BadRequestException(
            'A user with this email is already a member of this group',
          );
        }
      }
    }

    // Generate invite token if email provided
    const inviteToken = addMemberDto.memberEmail
      ? crypto.randomBytes(32).toString('hex')
      : null;

    // Create the group member
    const newMember = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || 'member',
        inviteToken,
        inviteStatus: addMemberDto.userId ? 'accepted' : 'pending',
        invitedEmail: addMemberDto.memberEmail, // Store email for pending invites
        joinedAt: addMemberDto.userId ? new Date() : null,
      },
      include: {
        user: true,
        group: true,
      },
    });

    // Send invite email if email was provided
    if (addMemberDto.memberEmail && inviteToken) {
      // Get inviter details
      const inviter = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const inviterName = inviter
        ? inviter.firstName && inviter.lastName
          ? `${inviter.firstName} ${inviter.lastName}`
          : inviter.username
        : 'Someone';

      // Send the invite email
      await this.emailService.sendGroupInviteEmail(
        addMemberDto.memberEmail,
        group.name,
        inviterName,
        inviteToken,
      );
    }

    return newMember;
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
        // memberName removed from schema
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
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            avatarSeed: true,
            avatarStyle: true,
            avatarUrl: true,
          },
        },
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
    cursor?: string, // Cursor for cursor-based pagination
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

    // Use cursor-based pagination if cursor is provided, otherwise fall back to offset
    type ExpenseWithRelations = Awaited<
      ReturnType<typeof this.prisma.groupExpense.findMany>
    >[number];

    let expenses: ExpenseWithRelations[];
    let nextCursor: string | null = null;

    if (cursor) {
      // Cursor-based pagination (more efficient)
      expenses = await this.prisma.groupExpense.findMany({
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
        orderBy: [
          { expenseDate: 'desc' },
          { id: 'desc' }, // Secondary sort for consistent ordering
        ],
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor itself
        take: limit,
      });

      // Set next cursor if there are more items
      if (expenses.length === limit) {
        nextCursor = expenses[expenses.length - 1].id;
      }
    } else {
      // Offset-based pagination (backward compatibility)
      const skip = (page - 1) * limit;

      expenses = await this.prisma.groupExpense.findMany({
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
        orderBy: [{ expenseDate: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      });

      // Set next cursor for first page
      if (expenses.length === limit) {
        nextCursor = expenses[expenses.length - 1].id;
      }
    }

    // Check expense count cache (only for offset pagination)
    let total: number | undefined;
    if (!cursor) {
      const cached = this.cacheService.getCachedExpenseCount(groupId);

      if (cached !== null) {
        total = cached;
      } else {
        total = await this.prisma.groupExpense.count({
          where: { groupId },
        });
        this.cacheService.setCachedExpenseCount(groupId, total);
      }
    }

    return {
      data: expenses,
      pagination: cursor
        ? {
            // Cursor-based response
            limit,
            nextCursor,
            hasMore: nextCursor !== null,
          }
        : {
            // Offset-based response (backward compatibility)
            page,
            limit,
            total: total!,
            totalPages: Math.ceil(total! / limit),
            hasMore: page * limit < total!,
            nextCursor, // Include cursor for migration
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

    const balanceService = this.balanceCalculationService;
    const balances = balanceService.calculateGroupBalances(
      expenses as unknown as GroupExpenseWithSplits[],
    );
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
   * Create a group expense - delegated to GroupExpenseService
   */
  async createGroupExpense(
    groupId: string,
    createExpenseDto: CreateGroupExpenseDto,
    userId: string,
  ) {
    return this.expenseService.createExpense(groupId, createExpenseDto, userId);
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
        // splitCalculations removed - model deleted
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  /**
   * Update a group expense - delegated to GroupExpenseService
   */
  async updateGroupExpense(
    groupId: string,
    expenseId: string,
    updateDto: UpdateGroupExpenseDto,
    userId: string,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isAdmin = this.isGroupAdmin(group, userId);
    return this.expenseService.updateExpense(
      groupId,
      expenseId,
      updateDto,
      userId,
      isAdmin,
    );
  }
  /**
   * Delete a group expense - delegated to GroupExpenseService
   */
  async deleteGroupExpense(groupId: string, expenseId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isAdmin = this.isGroupAdmin(group, userId);
    return this.expenseService.deleteExpense(
      groupId,
      expenseId,
      userId,
      isAdmin,
    );
  }

  // ==================== BALANCE & SETTLEMENT METHODS ====================

  /**
   * Get all balances for a group (with caching)
   */
  async getGroupBalances(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    // Check cache first
    const expenseCount = await this.prisma.groupExpense.count({
      where: { groupId },
    });
    const cached = this.cacheService.getCachedBalance(groupId, expenseCount);

    // Return cached if valid
    if (cached) {
      return Array.from(cached.values()).map((balance) => ({
        userId: balance.userId,
        totalPaid: balance.totalPaid,
        totalOwed: balance.totalOwed,
        balance: balance.balance,
        formatted: this.balanceCalculationService.formatBalance(
          balance.balance,
        ),
      }));
    }

    // Calculate fresh balances
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

    const balances = this.balanceCalculationService.calculateGroupBalances(
      expenses as unknown as GroupExpenseWithSplits[],
    );

    // Cache the results
    this.cacheService.setCachedBalance(groupId, balances, expenseCount);

    return Array.from(balances.values()).map((balance) => ({
      userId: balance.userId,
      totalPaid: balance.totalPaid,
      totalOwed: balance.totalOwed,
      balance: balance.balance,
      formatted: this.balanceCalculationService.formatBalance(balance.balance),
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

    const balances = this.balanceCalculationService.calculateGroupBalances(
      expenses as unknown as GroupExpenseWithSplits[],
    );
    const userBalance = this.balanceCalculationService.getUserBalance(
      balances,
      targetUserId,
    );

    return {
      userId: targetUserId,
      balance: userBalance,
      formatted: this.balanceCalculationService.formatBalance(userBalance),
    };
  }

  /**
   * Get simplified debts (debt simplification algorithm)
   * Uses greedy algorithm to minimize number of transactions
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

    // Calculate balances for all group members
    // Note: Using type assertion because Prisma returns Decimal type
    // but balance calculation service handles both Decimal and number
    const balances = this.balanceCalculationService.calculateGroupBalances(
      expenses as unknown as GroupExpenseWithSplits[],
    );

    // Simplify debts using greedy algorithm
    const simplifiedDebts = this.debtSettlementService.simplifyDebts(balances);

    // Collect all unique user IDs to fetch in a single query (fixes N+1 problem)
    const userIds = new Set<string>();
    simplifiedDebts.forEach((debt) => {
      userIds.add(debt.from);
      userIds.add(debt.to);
    });

    // Fetch all users in a single query
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create a map for O(1) lookups
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Map debts with users
    const debtsWithUsers = simplifiedDebts.map((debt) => ({
      fromUserId: debt.from,
      toUserId: debt.to,
      amount: debt.amount,
      fromUser: userMap.get(debt.from),
      toUser: userMap.get(debt.to),
    }));

    return debtsWithUsers;
  }

  /**
   * Settle an expense - delegated to GroupExpenseService
   */
  async settleExpense(
    groupId: string,
    expenseId: string,
    settleDto: SettleExpenseDto,
    userId: string,
  ) {
    await this.verifyGroupMembership(groupId, userId);
    return this.expenseService.settleExpense(groupId, expenseId, settleDto);
  }

  /**
   * Record a settlement between two users
   */
  async recordSettlement(
    groupId: string,
    settlementDto: RecordSettlementDto,
    userId: string,
  ) {
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

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get comprehensive group statistics - delegated to GroupStatisticsService
   */
  async getGroupStatistics(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);
    return this.statisticsService.getGroupStatistics(groupId, userId);
  }

  /**
   * Get monthly analytics - delegated to GroupStatisticsService
   */
  async getMonthlyAnalytics(
    groupId: string,
    userId: string,
    months: number = 6,
  ) {
    await this.verifyGroupMembership(groupId, userId);
    return this.statisticsService.getMonthlyAnalytics(groupId, months);
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
}
