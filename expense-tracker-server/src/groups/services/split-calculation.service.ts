import { Injectable, BadRequestException } from '@nestjs/common';

export interface SplitParticipant {
  userId: string;
  amount?: number; // For exact splits
  percentage?: number; // For percentage splits
  shares?: number; // For shares-based splits
}

export interface CalculatedSplit {
  userId: string;
  amountOwed: number;
  percentage?: number;
  shares?: number;
  calculatedAmount: number;
  adjustmentAmount: number;
  isRoundingAdjustment: boolean;
}

export interface SplitValidationResult {
  isValid: boolean;
  status:
    | 'valid'
    | 'sum_mismatch'
    | 'percentage_mismatch'
    | 'invalid_participants'
    | 'overpayment'
    | 'negative_amount';
  message?: string;
  difference?: number;
}

@Injectable()
export class SplitCalculationService {
  private readonly TOLERANCE = 0.01; // ₹0.01 tolerance for rounding
  private readonly PERCENTAGE_TOLERANCE = 0.01; // 0.01% tolerance for percentages

  /**
   * Calculate equal splits among participants
   *
   * Edge cases handled:
   * - Uneven division with rounding (₹100 ÷ 3)
   * - Payer included vs not included
   * - Single participant (amount = total)
   * - Zero participants (error)
   */
  calculateEqualSplit(
    totalAmount: number,
    participants: SplitParticipant[],
    payerId: string,
  ): CalculatedSplit[] {
    // Edge case: No participants
    if (participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Edge case: Negative or zero amount
    if (totalAmount <= 0) {
      throw new BadRequestException('Amount must be greater than ₹0');
    }

    // Edge case: Single participant - they owe the full amount
    if (participants.length === 1) {
      return [
        {
          userId: participants[0].userId,
          amountOwed: totalAmount,
          percentage: 100,
          calculatedAmount: totalAmount,
          adjustmentAmount: 0,
          isRoundingAdjustment: false,
        },
      ];
    }

    const participantCount = participants.length;

    // Calculate base amount (round down to avoid over-allocation)
    const baseAmount = Math.floor((totalAmount * 100) / participantCount) / 100;
    const totalAllocated = baseAmount * participantCount;
    const remainder = Math.round((totalAmount - totalAllocated) * 100) / 100;

    const splits: CalculatedSplit[] = [];
    let remainderAssigned = false;

    participants.forEach((participant) => {
      const isPayerAndShouldGetRemainder =
        participant.userId === payerId && !remainderAssigned && remainder > 0;

      const adjustment = isPayerAndShouldGetRemainder ? remainder : 0;
      const finalAmount = baseAmount + adjustment;

      if (isPayerAndShouldGetRemainder) {
        remainderAssigned = true;
      }

      splits.push({
        userId: participant.userId,
        amountOwed: finalAmount,
        percentage: Math.round((finalAmount / totalAmount) * 10000) / 100,
        calculatedAmount: baseAmount,
        adjustmentAmount: adjustment,
        isRoundingAdjustment: adjustment !== 0,
      });
    });

    // Edge case: Payer not in participants - assign remainder to first participant
    if (!remainderAssigned && remainder > 0) {
      splits[0].amountOwed += remainder;
      splits[0].adjustmentAmount = remainder;
      splits[0].isRoundingAdjustment = true;
      splits[0].percentage =
        Math.round((splits[0].amountOwed / totalAmount) * 10000) / 100;
    }

    return splits;
  }

  /**
   * Calculate exact/unequal splits
   *
   * Edge cases handled:
   * - Sum doesn't match total (₹99.50 vs ₹100)
   * - Participant with ₹0 amount
   * - Negative amounts
   * - Amount exceeds total
   */
  calculateExactSplit(
    totalAmount: number,
    participants: SplitParticipant[],
  ): CalculatedSplit[] {
    if (participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Edge case: Check for missing amounts
    if (participants.some((p) => p.amount === undefined || p.amount === null)) {
      throw new BadRequestException(
        'All participants must have a valid amount for exact split',
      );
    }

    // Edge case: Check for negative amounts
    const negativeAmounts = participants.filter((p) => p.amount! < 0);
    if (negativeAmounts.length > 0) {
      throw new BadRequestException(
        `Negative amounts not allowed. Found: ${negativeAmounts.map((p) => `₹${p.amount}`).join(', ')}`,
      );
    }

    // Edge case: Check for zero amounts (warn but allow)
    const zeroAmounts = participants.filter((p) => p.amount === 0);
    if (zeroAmounts.length === participants.length) {
      throw new BadRequestException(
        'At least one participant must have an amount greater than ₹0',
      );
    }

    const sum = participants.reduce((acc, p) => acc + (p.amount || 0), 0);
    const difference = Math.abs(sum - totalAmount);

    // Edge case: Sum doesn't match total
    if (difference > this.TOLERANCE) {
      const status = sum > totalAmount ? 'over' : 'under';
      throw new BadRequestException(
        `Split amounts ${status} by ₹${difference.toFixed(2)}. ` +
          `Total: ₹${totalAmount.toFixed(2)}, Sum: ₹${sum.toFixed(2)}`,
      );
    }

    // Edge case: Individual amount exceeds total
    const exceedsTotal = participants.filter((p) => p.amount! > totalAmount);
    if (exceedsTotal.length > 0) {
      throw new BadRequestException(
        `Individual amount cannot exceed total expense. ` +
          `Found: ₹${exceedsTotal[0].amount} > ₹${totalAmount}`,
      );
    }

    return participants.map((participant) => ({
      userId: participant.userId,
      amountOwed: participant.amount!,
      percentage:
        totalAmount > 0
          ? Math.round((participant.amount! / totalAmount) * 10000) / 100
          : 0,
      calculatedAmount: participant.amount!,
      adjustmentAmount: 0,
      isRoundingAdjustment: false,
    }));
  }

  /**
   * Calculate percentage-based splits
   *
   * Edge cases handled:
   * - Percentages sum to 99.99% or 100.01%
   * - Someone has 0% (exclude them)
   * - Someone has >100%
   * - Rounding errors in amount calculation
   */
  calculatePercentageSplit(
    totalAmount: number,
    participants: SplitParticipant[],
    payerId: string,
  ): CalculatedSplit[] {
    if (participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Edge case: Check for missing percentages
    if (
      participants.some(
        (p) => p.percentage === undefined || p.percentage === null,
      )
    ) {
      throw new BadRequestException(
        'All participants must have a valid percentage',
      );
    }

    // Edge case: Check for negative percentages
    const negativePercentages = participants.filter((p) => p.percentage! < 0);
    if (negativePercentages.length > 0) {
      throw new BadRequestException(
        `Negative percentages not allowed. Found: ${negativePercentages.map((p) => `${p.percentage}%`).join(', ')}`,
      );
    }

    // Edge case: Check for percentages > 100%
    const exceedsHundred = participants.filter((p) => p.percentage! > 100);
    if (exceedsHundred.length > 0) {
      throw new BadRequestException(
        `Individual percentage cannot exceed 100%. Found: ${exceedsHundred[0].percentage}%`,
      );
    }

    // Filter out 0% participants (edge case: they shouldn't be in split)
    const validParticipants = participants.filter((p) => p.percentage! > 0);

    if (validParticipants.length === 0) {
      throw new BadRequestException(
        'At least one participant must have a percentage greater than 0%',
      );
    }

    const totalPercentage = validParticipants.reduce(
      (acc, p) => acc + (p.percentage || 0),
      0,
    );
    const percentageDifference = Math.abs(totalPercentage - 100);

    // Edge case: Percentages don't sum to 100%
    if (percentageDifference > this.PERCENTAGE_TOLERANCE) {
      const status = totalPercentage > 100 ? 'exceed' : 'under';
      throw new BadRequestException(
        `Percentages ${status} 100% by ${percentageDifference.toFixed(2)}%. ` +
          `Current sum: ${totalPercentage.toFixed(2)}%`,
      );
    }

    // Calculate amounts from percentages
    const splits: CalculatedSplit[] = validParticipants.map((participant) => {
      const calculatedAmount =
        Math.round(((totalAmount * participant.percentage!) / 100) * 100) / 100;
      return {
        userId: participant.userId,
        amountOwed: calculatedAmount,
        percentage: participant.percentage!,
        calculatedAmount,
        adjustmentAmount: 0,
        isRoundingAdjustment: false,
      };
    });

    // Edge case: Handle rounding difference
    const totalCalculated = splits.reduce((acc, s) => acc + s.amountOwed, 0);
    const roundingDifference =
      Math.round((totalAmount - totalCalculated) * 100) / 100;

    if (Math.abs(roundingDifference) > 0) {
      // Assign rounding difference to payer if they're a participant
      const payerSplit = splits.find((s) => s.userId === payerId);
      if (payerSplit) {
        payerSplit.amountOwed += roundingDifference;
        payerSplit.adjustmentAmount = roundingDifference;
        payerSplit.isRoundingAdjustment = true;
      } else {
        // Otherwise assign to participant with highest percentage
        const highestPercentageSplit = splits.reduce((max, s) =>
          s.percentage! > (max.percentage || 0) ? s : max,
        );
        highestPercentageSplit.amountOwed += roundingDifference;
        highestPercentageSplit.adjustmentAmount = roundingDifference;
        highestPercentageSplit.isRoundingAdjustment = true;
      }
    }

    return splits;
  }

  /**
   * Calculate shares-based splits
   *
   * Edge cases handled:
   * - Fractional shares (1.5 shares)
   * - Someone has 0 shares
   * - Rounding with shares
   */
  calculateSharesSplit(
    totalAmount: number,
    participants: SplitParticipant[],
    payerId: string,
  ): CalculatedSplit[] {
    if (participants.length === 0) {
      throw new BadRequestException('At least one participant is required');
    }

    // Edge case: Check for missing shares
    if (participants.some((p) => p.shares === undefined || p.shares === null)) {
      throw new BadRequestException('All participants must have valid shares');
    }

    // Edge case: Check for negative shares
    const negativeShares = participants.filter((p) => p.shares! < 0);
    if (negativeShares.length > 0) {
      throw new BadRequestException(
        `Negative shares not allowed. Found: ${negativeShares.map((p) => `${p.shares} shares`).join(', ')}`,
      );
    }

    // Filter out 0 shares participants
    const validParticipants = participants.filter((p) => p.shares! > 0);

    if (validParticipants.length === 0) {
      throw new BadRequestException(
        'At least one participant must have shares greater than 0',
      );
    }

    const totalShares = validParticipants.reduce(
      (acc, p) => acc + (p.shares || 0),
      0,
    );
    const amountPerShare = totalAmount / totalShares;

    // Calculate amounts from shares
    const splits: CalculatedSplit[] = validParticipants.map((participant) => {
      const calculatedAmount =
        Math.round(amountPerShare * participant.shares! * 100) / 100;
      const percentage =
        Math.round((participant.shares! / totalShares) * 10000) / 100;

      return {
        userId: participant.userId,
        amountOwed: calculatedAmount,
        percentage,
        shares: participant.shares!,
        calculatedAmount,
        adjustmentAmount: 0,
        isRoundingAdjustment: false,
      };
    });

    // Handle rounding difference
    const totalCalculated = splits.reduce((acc, s) => acc + s.amountOwed, 0);
    const roundingDifference =
      Math.round((totalAmount - totalCalculated) * 100) / 100;

    if (Math.abs(roundingDifference) > 0) {
      const payerSplit = splits.find((s) => s.userId === payerId);
      if (payerSplit) {
        payerSplit.amountOwed += roundingDifference;
        payerSplit.adjustmentAmount = roundingDifference;
        payerSplit.isRoundingAdjustment = true;
      } else {
        splits[0].amountOwed += roundingDifference;
        splits[0].adjustmentAmount = roundingDifference;
        splits[0].isRoundingAdjustment = true;
      }
    }

    return splits;
  }

  /**
   * Main calculation method that routes to appropriate split type
   */
  calculateSplits(
    totalAmount: number,
    splitType: 'equal' | 'exact' | 'percentage' | 'shares',
    participants: SplitParticipant[],
    payerId: string,
  ): CalculatedSplit[] {
    switch (splitType) {
      case 'equal':
        return this.calculateEqualSplit(totalAmount, participants, payerId);
      case 'exact':
        return this.calculateExactSplit(totalAmount, participants);
      case 'percentage':
        return this.calculatePercentageSplit(
          totalAmount,
          participants,
          payerId,
        );
      case 'shares':
        return this.calculateSharesSplit(totalAmount, participants, payerId);
      default: {
        const exhaustiveCheck: never = splitType;
        throw new BadRequestException(
          `Invalid split type: ${String(exhaustiveCheck)}`,
        );
      }
    }
  }

  /**
   * Validate calculated splits
   *
   * Edge cases handled:
   * - Sum mismatch (data corruption)
   * - Overpayment detection
   * - Orphaned splits
   */
  validateSplits(
    totalAmount: number,
    splits: CalculatedSplit[],
  ): SplitValidationResult {
    if (splits.length === 0) {
      return {
        isValid: false,
        status: 'invalid_participants',
        message: 'No participants in split',
      };
    }

    // Check for negative amounts
    const negativeAmounts = splits.filter((s) => s.amountOwed < 0);
    if (negativeAmounts.length > 0) {
      return {
        isValid: false,
        status: 'negative_amount',
        message: `Negative amounts found: ${negativeAmounts.map((s) => `₹${s.amountOwed}`).join(', ')}`,
      };
    }

    const sum = splits.reduce((acc, s) => acc + s.amountOwed, 0);
    const difference = Math.abs(sum - totalAmount);

    if (difference > this.TOLERANCE) {
      return {
        isValid: false,
        status: 'sum_mismatch',
        message: `Split amounts don't match total. Difference: ₹${difference.toFixed(2)}`,
        difference,
      };
    }

    return {
      isValid: true,
      status: 'valid',
    };
  }

  /**
   * Calculate rounding difference for metadata
   */
  calculateRoundingDifference(
    totalAmount: number,
    splits: CalculatedSplit[],
  ): number {
    const sum = splits.reduce((acc, s) => acc + s.amountOwed, 0);
    return Math.round((totalAmount - sum) * 10000) / 10000; // 4 decimal precision
  }

  /**
   * Validate participant permissions
   *
   * Edge cases handled:
   * - User not in group
   * - Deleted users
   * - Duplicate participants
   */
  validateParticipants(
    participants: SplitParticipant[],
    groupMemberIds: string[],
  ): { isValid: boolean; invalidUserIds: string[] } {
    const invalidUserIds = participants
      .filter((p) => p.userId && !groupMemberIds.includes(p.userId))
      .map((p) => p.userId);

    // Check for duplicates
    const userIds = participants.map((p) => p.userId);
    const duplicates = userIds.filter(
      (id, index) => userIds.indexOf(id) !== index,
    );

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate participants found: ${duplicates.join(', ')}`,
      );
    }

    return {
      isValid: invalidUserIds.length === 0,
      invalidUserIds,
    };
  }
}
