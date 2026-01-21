import { Loan } from '@prisma/client';

export interface GroupLoanDto {
  groupId: string;
  groupName: string;
  groupIcon?: string;
  groupColor?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  amount: number;
  currency: string;
  type: 'owed_to_me' | 'i_owe';
  canConvertToLoan: boolean;
  lastExpenseDate?: Date;
}

export interface PersonLoanSummaryDto {
  personId: string;
  personName: string;
  personAvatar?: string | null;
  totalAmount: number;
  currency: string;
  loanType: 'lent' | 'borrowed';

  // Breakdown
  directLoanAmount: number;
  groupBalanceAmount: number;
  groupDetails: Array<{
    groupId: string;
    groupName: string;
    amount: number;
  }>;

  // Existing fields
  loanIds: string[];
  lastLoanDate: Date;
}

export interface LoanStatisticsDto {
  totalLent: number;
  totalBorrowed: number;
  netPosition: number;
  totalLentOutstanding: number;
  totalBorrowedOutstanding: number;
  activeLoansCount: number;
  groupDebtsCount: number;
}

export interface LoanWithRelations extends Loan {
  lender: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
    avatarUrl?: string | null;
  };
  borrower: {
    id: string;
    username: string;
    email: string;
    avatar?: string | null;
    avatarUrl?: string | null;
  };
  group?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  _count?: {
    adjustments: number;
    payments: number;
  };
}

export class ConsolidatedLoanResponseDto {
  directLoans: LoanWithRelations[];
  groupLoans: GroupLoanDto[];
  personSummaries: PersonLoanSummaryDto[];
  statistics: LoanStatisticsDto;
}
