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

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

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
      const searchFilter = QueryBuilder.buildTextSearchFilter(query.search, [
        'description',
      ]);
      if (searchFilter) {
        Object.assign(where, searchFilter);
      }
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
      query.limit || 20,
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

  // Note: Invite functionality removed due to schema limitations
  // To re-enable, add inviteToken, inviteStatus, lenderEmail, borrowerEmail fields to Loan model

  // Helper method to check if user has access to loan
  private hasAccessToLoan(loan: Loan, userId: string): boolean {
    return loan.lenderUserId === userId || loan.borrowerUserId === userId;
  }
}
