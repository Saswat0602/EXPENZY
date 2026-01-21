import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoanAdjustmentDto } from '../dto/loan-adjustment.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoanAdjustmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add an adjustment to a loan (payment, increase, decrease, or waive)
   */
  async addAdjustment(
    loanId: string,
    adjustmentDto: LoanAdjustmentDto,
    userId: string,
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new BadRequestException('Loan not found');
    }

    // Validate adjustment amount
    if (adjustmentDto.adjustmentType === 'payment') {
      if (new Decimal(adjustmentDto.amount).greaterThan(loan.amountRemaining)) {
        throw new BadRequestException(
          'Payment amount cannot exceed remaining loan amount',
        );
      }
    }

    // Calculate new amounts
    const { newAmountPaid, newAmountRemaining, newStatus } =
      this.calculateUpdatedAmount(
        loan.amountPaid,
        loan.amountRemaining,
        loan.amount,
        adjustmentDto.amount,
        adjustmentDto.adjustmentType,
      );

    // Create adjustment record
    const adjustment = await this.prisma.loanAdjustment.create({
      data: {
        loanId,
        adjustmentType: adjustmentDto.adjustmentType,
        amount: adjustmentDto.amount,
        currency: loan.currency,
        reason: adjustmentDto.reason,
        notes: adjustmentDto.notes,
        paymentMethod: adjustmentDto.paymentMethod,
        paymentDate: adjustmentDto.paymentDate
          ? new Date(adjustmentDto.paymentDate)
          : null,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Update loan
    const updateData: {
      amountPaid: Decimal;
      amountRemaining: Decimal;
      status: string;
      lastPaymentDate?: Date;
    } = {
      amountPaid: newAmountPaid,
      amountRemaining: newAmountRemaining,
      status: newStatus,
    };

    if (adjustmentDto.adjustmentType === 'payment') {
      updateData.lastPaymentDate = adjustmentDto.paymentDate
        ? new Date(adjustmentDto.paymentDate)
        : new Date();
    }

    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: updateData,
    });

    return {
      adjustment,
      loan: updatedLoan,
    };
  }

  /**
   * Get all adjustments for a loan
   */
  async getAdjustments(loanId: string) {
    return this.prisma.loanAdjustment.findMany({
      where: { loanId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Calculate updated loan amounts after an adjustment
   */
  calculateUpdatedAmount(
    currentAmountPaid: Decimal,
    currentAmountRemaining: Decimal,
    totalAmount: Decimal,
    adjustmentAmount: number,
    adjustmentType: string,
  ): {
    newAmountPaid: Decimal;
    newAmountRemaining: Decimal;
    newStatus: string;
  } {
    let newAmountPaid = new Decimal(currentAmountPaid);
    let newAmountRemaining = new Decimal(currentAmountRemaining);
    let newStatus = 'active';

    const adjustment = new Decimal(adjustmentAmount);

    switch (adjustmentType) {
      case 'payment':
        newAmountPaid = newAmountPaid.plus(adjustment);
        newAmountRemaining = newAmountRemaining.minus(adjustment);
        if (newAmountRemaining.lessThanOrEqualTo(0)) {
          newAmountRemaining = new Decimal(0);
          newStatus = 'paid';
        }
        break;

      case 'increase':
        // Increase the total loan amount
        newAmountRemaining = newAmountRemaining.plus(adjustment);
        break;

      case 'decrease':
        // Decrease the remaining amount (partial forgiveness)
        newAmountRemaining = newAmountRemaining.minus(adjustment);
        if (newAmountRemaining.lessThanOrEqualTo(0)) {
          newAmountRemaining = new Decimal(0);
          newStatus = 'paid';
        }
        break;

      case 'waive':
        // Complete debt forgiveness
        newAmountRemaining = new Decimal(0);
        newStatus = 'waived';
        break;

      default:
        throw new BadRequestException('Invalid adjustment type');
    }

    return {
      newAmountPaid,
      newAmountRemaining,
      newStatus,
    };
  }
}
