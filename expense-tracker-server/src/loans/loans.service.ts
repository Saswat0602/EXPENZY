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
  ConsolidatedLoanResponseDto,
  GroupLoanDto,
  LoanStatisticsDto,
  LoanWithRelations,
  PersonLoanSummaryDto,
} from './dto/consolidated-loan-response.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) { }

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
          select: { payments: true },
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
        payments: {
          orderBy: { paymentDate: 'desc' },
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
      include: { payments: true },
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
      // Create payment
      await tx.loanPayment.create({
        data: {
          loanId: id,
          amount: createLoanPaymentDto.amount,
          currency: createLoanPaymentDto.currency || loan.currency,
          paymentDate: new Date(createLoanPaymentDto.paymentDate),
          paymentMethod: createLoanPaymentDto.paymentMethod,
          notes: createLoanPaymentDto.notes,
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
          payments: true,
        },
      });

      return updatedLoan;
    });
  }

  /**
   * Get consolidated view of all loans (direct + group-derived)
   */
  async getConsolidatedLoans(userId: string) {
    // Get direct loans
    const directLoans = (await this.prisma.loan.findMany({
      where: {
        OR: [{ lenderUserId: userId }, { borrowerUserId: userId }],
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
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        _count: {
          select: {
            adjustments: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })) as LoanWithRelations[];

    // Group loans by person
    const personMap = new Map<string, {
      person: { id: string; username: string; avatar?: string | null; avatarUrl?: string | null };
      loans: LoanWithRelations[];
      totalLent: number;
      totalBorrowed: number;
    }>();

    for (const loan of directLoans) {
      const isLender = loan.lenderUserId === userId;
      const otherPerson = isLender ? loan.borrower : loan.lender;
      const personId = otherPerson.id;

      if (!personMap.has(personId)) {
        personMap.set(personId, {
          person: otherPerson,
          loans: [],
          totalLent: 0,
          totalBorrowed: 0,
        });
      }

      const personData = personMap.get(personId)!;
      personData.loans.push(loan);

      // Only count active and paid loans for totals
      if (loan.status === 'active' || loan.status === 'paid') {
        if (isLender) {
          personData.totalLent += Number(loan.amountRemaining);
        } else {
          personData.totalBorrowed += Number(loan.amountRemaining);
        }
      }
    }

    // Convert to PersonLoanSummaryDto
    const personSummaries = Array.from(personMap.values()).map((data) => {
      const netAmount = data.totalLent - data.totalBorrowed;
      const loanType: 'lent' | 'borrowed' = netAmount >= 0 ? 'lent' : 'borrowed';
      const totalAmount = Math.abs(netAmount);

      return {
        personId: data.person.id,
        personName: data.person.username,
        personAvatar: data.person.avatarUrl || data.person.avatar,
        totalAmount,
        currency: data.loans[0]?.currency || 'INR',
        loanType,
        loanIds: data.loans.map((l) => l.id),
        activeCount: data.loans.filter((l) => l.status === 'active').length,
        paidCount: data.loans.filter((l) => l.status === 'paid').length,
        lastLoanDate: data.loans[0]?.loanDate || new Date(),
      };
    }).filter((summary) => summary.totalAmount > 0); // Only show if there's an outstanding balance

    // Get group-derived loans
    const groupLoans = await this.getGroupDerivedLoans(userId);

    // Calculate statistics
    const statistics = await this.getLoanStatistics(userId);

    const response = new ConsolidatedLoanResponseDto();
    response.directLoans = directLoans;
    response.groupLoans = groupLoans;
    response.personSummaries = personSummaries;
    response.statistics = statistics;

    return response;
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
        payments: {
          orderBy: {
            paymentDate: 'desc',
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
