import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Loan, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CreateLoanPaymentDto } from './dto/create-loan-payment.dto';
import { LoanQueryDto, LoanRole } from './dto/loan-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { QueryBuilder } from '../common/utils/query-builder.util';
import {
  GroupLoanDto,
  LoanStatisticsDto,
} from './dto/consolidated-loan-response.dto';
import {
  BalanceCalculationService,
  GroupExpenseWithSplits,
} from '../groups/services/balance-calculation.service';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private balanceCalculationService: BalanceCalculationService,
  ) {}

  async create(createLoanDto: CreateLoanDto) {
    // Validation: Both lender and borrower user IDs must be provided
    if (!createLoanDto.lenderUserId || !createLoanDto.borrowerUserId) {
      throw new BadRequestException(
        'Both lender and borrower user IDs must be provided',
      );
    }

    // Prevent self-loans
    if (createLoanDto.lenderUserId === createLoanDto.borrowerUserId) {
      throw new BadRequestException('Cannot create a loan to yourself');
    }

    const amountRemaining = createLoanDto.amount;

    return this.prisma.loan.create({
      data: {
        lenderUserId: createLoanDto.lenderUserId,
        borrowerUserId: createLoanDto.borrowerUserId,
        amount: createLoanDto.amount,
        currency: createLoanDto.currency || 'USD',
        interestRate: createLoanDto.interestRate || 0,
        description: createLoanDto.description,
        loanDate: new Date(createLoanDto.loanDate),
        dueDate: createLoanDto.dueDate ? new Date(createLoanDto.dueDate) : null,
        paymentTerms: createLoanDto.paymentTerms,
        amountRemaining,
      },
      include: {
        lender: true,
        borrower: true,
      },
    });
  }

  async findAll(userId: string, query: LoanQueryDto) {
    // Build where clause based on role
    const where: Prisma.LoanWhereInput = {};

    if (query.role === LoanRole.LENDER) {
      where.lenderUserId = userId;
    } else if (query.role === LoanRole.BORROWER) {
      where.borrowerUserId = userId;
    } else {
      // ALL - user is either lender or borrower
      where.OR = [{ lenderUserId: userId }, { borrowerUserId: userId }];
    }

    // Add filters
    if (query.status) {
      where.status = query.status;
    }

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      where.amount = QueryBuilder.buildNumberRangeFilter(
        query.minAmount,
        query.maxAmount,
      );
    }

    if (query.startDate || query.endDate) {
      where.loanDate = QueryBuilder.buildDateRangeFilter(
        query.startDate,
        query.endDate,
      );
    }

    if (query.overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = 'active'; // Only active loans can be overdue
    }

    if (query.search) {
      // Search in description, lender name, and borrower name
      where.OR = [
        {
          description: {
            contains: query.search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          lender: {
            username: {
              contains: query.search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
        {
          borrower: {
            username: {
              contains: query.search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
      ];
    }

    // Build orderBy clause
    const allowedSortFields = [
      'dueDate',
      'amount',
      'loanDate',
      'createdAt',
      'status',
    ];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.LoanOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Get total count
    const total = await this.prisma.loan.count({ where });

    // Get paginated data with optimized includes
    const data = await this.prisma.loan.findMany({
      where,
      select: {
        id: true,
        amount: true,
        currency: true,
        interestRate: true,
        description: true,
        loanDate: true,
        dueDate: true,
        status: true,
        amountPaid: true,
        amountRemaining: true,
        paymentTerms: true,
        createdAt: true,
        updatedAt: true,
        lender: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        borrower: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        _count: {
          select: { adjustments: true },
        },
      },
      orderBy,
      skip: query.skip,
      take: query.take,
    });

    return new PaginatedResponseDto(
      data,
      query.page || 1,
      query.limit || 50,
      total,
    );
  }

  async findOne(id: string, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        lender: true,
        borrower: true,
        adjustments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    // Verify access: user must be lender, borrower, or creator
    if (!this.hasAccessToLoan(loan, userId)) {
      throw new ForbiddenException(
        'You do not have permission to access this loan',
      );
    }

    return loan;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    // Only lender or borrower can update loan details
    if (loan.lenderUserId !== userId && loan.borrowerUserId !== userId) {
      throw new ForbiddenException(
        'Only the lender or borrower can update loan details',
      );
    }

    return this.prisma.loan.update({
      where: { id },
      data: {
        amount: updateLoanDto.amount,
        currency: updateLoanDto.currency,
        interestRate: updateLoanDto.interestRate,
        description: updateLoanDto.description,
        loanDate: updateLoanDto.loanDate
          ? new Date(updateLoanDto.loanDate)
          : undefined,
        dueDate: updateLoanDto.dueDate
          ? new Date(updateLoanDto.dueDate)
          : undefined,
        paymentTerms: updateLoanDto.paymentTerms,
        status: updateLoanDto.status,
      },
      include: {
        lender: true,
        borrower: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    // Only lender can delete
    if (loan.lenderUserId !== userId) {
      throw new ForbiddenException('Only the lender can delete this loan');
    }

    // Soft delete by updating status
    return this.prisma.loan.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });
  }

  async addPayment(
    id: string,
    createLoanPaymentDto: CreateLoanPaymentDto,
    userId: string,
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { adjustments: true },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    // Verify access
    if (!this.hasAccessToLoan(loan, userId)) {
      throw new ForbiddenException(
        'You do not have permission to add payments to this loan',
      );
    }

    // Validate payment amount
    if (createLoanPaymentDto.amount > Number(loan.amountRemaining)) {
      throw new BadRequestException(
        `Payment amount (${createLoanPaymentDto.amount}) exceeds remaining amount (${Number(loan.amountRemaining)})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create loan adjustment (payment)
      await tx.loanAdjustment.create({
        data: {
          loanId: id,
          adjustmentType: 'payment',
          amount: createLoanPaymentDto.amount,
          currency: createLoanPaymentDto.currency || loan.currency,
          paymentDate: new Date(createLoanPaymentDto.paymentDate),
          paymentMethod: createLoanPaymentDto.paymentMethod,
          notes: createLoanPaymentDto.notes,
          createdBy: userId,
        },
      });

      // Update loan
      const newAmountPaid =
        Number(loan.amountPaid) + Number(createLoanPaymentDto.amount);
      const newAmountRemaining = Number(loan.amount) - newAmountPaid;
      const newStatus = newAmountRemaining <= 0 ? 'paid' : 'active';

      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountRemaining: newAmountRemaining,
          status: newStatus,
        },
        include: {
          lender: true,
          borrower: true,
          adjustments: true,
        },
      });

      return updatedLoan;
    });
  }

  /**
   * Get consolidated group balances across ALL groups for a user
   * Returns Map<otherUserId, { amount, groups }>
   * Positive amount = they owe you, Negative = you owe them
   */
  private async getAllGroupBalancesForUser(userId: string): Promise<
    Map<
      string,
      {
        amount: number;
        groups: Array<{ groupId: string; groupName: string; amount: number }>;
      }
    >
  > {
    const balanceMap = new Map<
      string,
      {
        amount: number;
        groups: Array<{ groupId: string; groupName: string; amount: number }>;
      }
    >();

    // Get all groups user is a member of
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: { userId, inviteStatus: 'accepted' },
        },
      },
      select: {
        id: true,
        name: true,
        groupExpenses: {
          where: { isSettled: false },
          select: {
            id: true,
            amount: true,
            paidByUserId: true,
            splits: {
              select: {
                userId: true,
                amountOwed: true,
              },
            },
          },
        },
      },
    });

    // For each group, calculate balances and aggregate
    for (const group of groups) {
      if (group.groupExpenses.length === 0) continue;

      // Calculate balances using the balance calculation service
      const balances = this.balanceCalculationService.calculateGroupBalances(
        group.groupExpenses as unknown as GroupExpenseWithSplits[],
      );

      // Simplify debts to get direct debts
      const simplifiedDebts =
        this.balanceCalculationService.simplifyDebts(balances);

      // Process debts involving this user
      simplifiedDebts.forEach((debt) => {
        if (debt.from === userId) {
          // User owes someone
          const existing = balanceMap.get(debt.to) || {
            amount: 0,
            groups: [],
          };
          existing.amount -= debt.amount; // Negative = owe
          existing.groups.push({
            groupId: group.id,
            groupName: group.name,
            amount: -debt.amount,
          });
          balanceMap.set(debt.to, existing);
        } else if (debt.to === userId) {
          // Someone owes user
          const existing = balanceMap.get(debt.from) || {
            amount: 0,
            groups: [],
          };
          existing.amount += debt.amount; // Positive = owed to you
          existing.groups.push({
            groupId: group.id,
            groupName: group.name,
            amount: debt.amount,
          });
          balanceMap.set(debt.from, existing);
        }
      });
    }

    return balanceMap;
  }

  /**
   * Get consolidated view of all loans (direct + group-derived)
   * Optimized to return only person summaries and statistics for the loans landing page
   */
  async getConsolidatedLoans(userId: string) {
    // 1. Get group balances across all groups
    const groupBalances = await this.getAllGroupBalancesForUser(userId);

    // 2. Build person map - calculate totals without fetching full loan details
    const personMap = new Map<
      string,
      {
        person: {
          id: string;
          username: string;
          avatar?: string | null;
          avatarUrl?: string | null;
          avatarSeed?: string | null;
          avatarStyle?: string | null;
        };
        totalLent: number;
        totalBorrowed: number;
        groupBalance: number;
        groupDetails: Array<{
          groupId: string;
          groupName: string;
          amount: number;
        }>;
        loanIds: string[];
        lastLoanDate: Date;
      }
    >();

    // 3. Aggregate loan data efficiently using groupBy
    const loanAggregates = await this.prisma.loan.groupBy({
      by: ['lenderUserId', 'borrowerUserId'],
      where: {
        OR: [{ lenderUserId: userId }, { borrowerUserId: userId }],
        isDeleted: false,
        status: { in: ['active', 'paid'] },
      },
      _sum: {
        amountRemaining: true,
      },
      _count: {
        id: true,
      },
    });

    // 4. Get unique user IDs from loans
    const userIds = new Set<string>();
    loanAggregates.forEach((agg) => {
      const otherUserId =
        agg.lenderUserId === userId ? agg.borrowerUserId : agg.lenderUserId;
      userIds.add(otherUserId);
    });

    // 5. Fetch user details for all involved users
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        username: true,
        avatar: true,
        avatarUrl: true,
        avatarSeed: true,
        avatarStyle: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // 6. Process aggregates to build person map
    for (const agg of loanAggregates) {
      const isLender = agg.lenderUserId === userId;
      const otherUserId = isLender ? agg.borrowerUserId : agg.lenderUserId;
      const otherUser = userMap.get(otherUserId);

      if (!otherUser) continue;

      if (!personMap.has(otherUserId)) {
        personMap.set(otherUserId, {
          person: otherUser,
          totalLent: 0,
          totalBorrowed: 0,
          groupBalance: 0,
          groupDetails: [],
          loanIds: [],
          lastLoanDate: new Date(),
        });
      }

      const personData = personMap.get(otherUserId)!;
      const amount = Number(agg._sum.amountRemaining || 0);

      if (isLender) {
        personData.totalLent += amount;
      } else {
        personData.totalBorrowed += amount;
      }
    }

    // 7. Get last loan date for each person
    for (const [otherUserId] of personMap.entries()) {
      const lastLoan = await this.prisma.loan.findFirst({
        where: {
          OR: [
            { lenderUserId: userId, borrowerUserId: otherUserId },
            { lenderUserId: otherUserId, borrowerUserId: userId },
          ],
          isDeleted: false,
        },
        orderBy: { loanDate: 'desc' },
        select: { loanDate: true, id: true },
      });

      if (lastLoan) {
        const personData = personMap.get(otherUserId)!;
        personData.lastLoanDate = lastLoan.loanDate;
      }
    }

    // 8. Merge group balances into person map
    for (const [otherUserId, groupData] of groupBalances.entries()) {
      if (!personMap.has(otherUserId)) {
        // Fetch user info for people only in groups
        const user = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            username: true,
            avatar: true,
            avatarUrl: true,
            avatarSeed: true,
            avatarStyle: true,
          },
        });

        if (!user) continue;

        personMap.set(otherUserId, {
          person: user,
          totalLent: 0,
          totalBorrowed: 0,
          groupBalance: 0,
          groupDetails: [],
          loanIds: [],
          lastLoanDate: new Date(),
        });
      }

      const personData = personMap.get(otherUserId)!;
      personData.groupBalance = groupData.amount;
      personData.groupDetails = groupData.groups;
    }

    // 9. Convert to PersonLoanSummary with breakdown
    const personSummaries = Array.from(personMap.values())
      .map((data) => {
        const directLoanNet = data.totalLent - data.totalBorrowed;
        const totalNet = directLoanNet + data.groupBalance;

        return {
          personId: data.person.id,
          personName: data.person.username,
          personAvatar: data.person.avatarUrl || data.person.avatar,
          personAvatarSeed: data.person.avatarSeed,
          personAvatarStyle: data.person.avatarStyle,
          totalAmount: Math.abs(totalNet),
          loanType: totalNet >= 0 ? ('lent' as const) : ('borrowed' as const),
          currency: 'INR', // Default currency

          // Breakdown
          directLoanAmount: directLoanNet,
          groupBalanceAmount: data.groupBalance,
          groupDetails: data.groupDetails,

          // Existing fields
          loanIds: data.loanIds,
          lastLoanDate: data.lastLoanDate,
        };
      })
      .filter((summary) => summary.totalAmount > 0.01); // Filter out near-zero balances

    // 10. Calculate statistics
    const statistics = await this.getLoanStatistics(userId);

    // Return only essential data
    return {
      personSummaries,
      statistics,
    };
  }

  /**
   * Create a loan from a group balance
   */
  async createLoanFromGroupBalance(
    groupId: string,
    lenderUserId: string,
    borrowerUserId: string,
    amount: number,
    description?: string,
    dueDate?: string,
  ) {
    // Verify both users are group members
    const [lenderMember, borrowerMember] = await Promise.all([
      this.prisma.groupMember.findFirst({
        where: { groupId, userId: lenderUserId, inviteStatus: 'accepted' },
      }),
      this.prisma.groupMember.findFirst({
        where: { groupId, userId: borrowerUserId, inviteStatus: 'accepted' },
      }),
    ]);

    if (!lenderMember || !borrowerMember) {
      throw new BadRequestException('Both users must be members of the group');
    }

    // Get group details for currency
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Create the loan
    return this.prisma.loan.create({
      data: {
        lenderUserId,
        borrowerUserId,
        amount,
        currency: group.currency,
        description: description || `Loan from ${group.name} group balance`,
        loanDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        amountRemaining: amount,
        groupId,
        sourceType: 'group_balance',
        sourceId: groupId,
      },
      include: {
        lender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        borrower: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  /**
   * Get loan statistics for a user
   */
  async getLoanStatistics(userId: string) {
    const [loansLent, loansBorrowed] = await Promise.all([
      this.prisma.loan.findMany({
        where: { lenderUserId: userId, isDeleted: false },
      }),
      this.prisma.loan.findMany({
        where: { borrowerUserId: userId, isDeleted: false },
      }),
    ]);

    const stats: LoanStatisticsDto = {
      totalLent: loansLent.reduce((sum, loan) => sum + Number(loan.amount), 0),
      totalBorrowed: loansBorrowed.reduce(
        (sum, loan) => sum + Number(loan.amount),
        0,
      ),
      netPosition: 0,
      totalLentOutstanding: loansLent.reduce(
        (sum, loan) => sum + Number(loan.amountRemaining),
        0,
      ),
      totalBorrowedOutstanding: loansBorrowed.reduce(
        (sum, loan) => sum + Number(loan.amountRemaining),
        0,
      ),
      activeLoansCount: [...loansLent, ...loansBorrowed].filter(
        (loan) => loan.status === 'active',
      ).length,
      groupDebtsCount: 0, // Will be calculated from group balances
    };

    stats.netPosition =
      stats.totalLentOutstanding - stats.totalBorrowedOutstanding;

    return stats;
  }

  /**
   * Get group-derived loans (balances from groups)
   */
  async getGroupDerivedLoans(userId: string) {
    // Get all groups user is a member of
    const groupMemberships = await this.prisma.groupMember.findMany({
      where: {
        userId,
        inviteStatus: 'accepted',
      },
      include: {
        group: {
          include: {
            groupExpenses: {
              include: {
                splits: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        avatar: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const groupLoans: GroupLoanDto[] = [];

    // For each group, calculate balances
    for (const membership of groupMemberships) {
      const group = membership.group;

      // Calculate balances using simplified debt algorithm
      const balances = new Map<string, number>();

      for (const expense of group.groupExpenses) {
        if (expense.isSettled) continue;

        for (const split of expense.splits) {
          if (!split.userId) continue;

          const owedAmount =
            Number(split.amountOwed) - Number(split.amountPaid);

          if (split.userId === userId) {
            // This user owes money
            if (expense.paidByUserId && expense.paidByUserId !== userId) {
              const currentBalance = balances.get(expense.paidByUserId) || 0;
              balances.set(expense.paidByUserId, currentBalance - owedAmount);
            }
          } else if (expense.paidByUserId === userId) {
            // This user is owed money
            const currentBalance = balances.get(split.userId) || 0;
            balances.set(split.userId, currentBalance + owedAmount);
          }
        }
      }

      // Convert balances to GroupLoanDto
      for (const [otherUserId, balance] of balances.entries()) {
        if (Math.abs(balance) < 0.01) continue; // Skip negligible balances

        const otherUser = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            username: true,
            avatar: true,
            avatarUrl: true,
          },
        });

        if (!otherUser) continue;

        groupLoans.push({
          groupId: group.id,
          groupName: group.name,
          groupIcon: group.icon || undefined,
          groupColor: group.color || undefined,
          otherUserId: otherUser.id,
          otherUserName: otherUser.username,
          otherUserAvatar: otherUser.avatarUrl || otherUser.avatar || undefined,
          amount: Math.abs(balance),
          currency: group.currency,
          type: balance > 0 ? 'owed_to_me' : 'i_owe',
          canConvertToLoan: true,
          lastExpenseDate: group.groupExpenses[0]?.expenseDate,
        });
      }
    }

    return groupLoans;
  }

  /**
   * Get all transactions between two users (loans, adjustments, payments)
   */
  /**
   * Get paginated loans between current user and a specific person
   */
  async getPersonLoansPaginated(
    userId: string,
    personId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const where: Prisma.LoanWhereInput = {
      OR: [
        {
          lenderUserId: userId,
          borrowerUserId: personId,
        },
        {
          lenderUserId: personId,
          borrowerUserId: userId,
        },
      ],
      isDeleted: false,
    };

    // Build cursor-based pagination
    const queryOptions: Prisma.LoanFindManyArgs = {
      where,
      take: limit + 1, // Fetch one extra to determine if there are more
      orderBy: {
        loanDate: 'desc',
      },
      include: {
        lender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
            avatarSeed: true,
            avatarStyle: true,
          },
        },
        borrower: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
            avatarSeed: true,
            avatarStyle: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        _count: {
          select: {
            adjustments: true,
          },
        },
      },
    };

    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    const loans = await this.prisma.loan.findMany(queryOptions);

    // Check if there are more results
    const hasMore = loans.length > limit;
    const data = hasMore ? loans.slice(0, limit) : loans;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      meta: {
        nextCursor,
        hasMore,
        limit,
      },
    };
  }

  async getTransactionsBetweenUsers(userId: string, otherUserId: string) {
    // Get all loans between these two users (in both directions)
    const loans = await this.prisma.loan.findMany({
      where: {
        OR: [
          { lenderUserId: userId, borrowerUserId: otherUserId },
          { lenderUserId: otherUserId, borrowerUserId: userId },
        ],
        isDeleted: false,
      },
      include: {
        lender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        borrower: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        adjustments: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        // payments removed - using adjustments instead
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const summary = {
      totalLoans: loans.length,
      activeLoans: loans.filter((l) => l.status === 'active').length,
      paidLoans: loans.filter((l) => l.status === 'paid').length,
      youOwe: 0,
      theyOwe: 0,
      netBalance: 0,
    };

    loans.forEach((loan) => {
      if (loan.lenderUserId === userId) {
        // You lent money
        summary.theyOwe += Number(loan.amountRemaining);
      } else {
        // You borrowed money
        summary.youOwe += Number(loan.amountRemaining);
      }
    });

    summary.netBalance = summary.theyOwe - summary.youOwe;

    return {
      loans,
      summary,
      otherUser: loans[0]
        ? loans[0].lenderUserId === userId
          ? loans[0].borrower
          : loans[0].lender
        : null,
    };
  }

  // Note: Invite functionality removed due to schema limitations
  // To re-enable, add inviteToken, inviteStatus, lenderEmail, borrowerEmail fields to Loan model

  // Helper method to check if user has access to loan
  private hasAccessToLoan(loan: Loan, userId: string): boolean {
    return loan.lenderUserId === userId || loan.borrowerUserId === userId;
  }
}
