Critical Edge Cases for Splitwise-like App
1. Split Calculation Edge Cases
Equal Split:

₹100 ÷ 3 people = ₹33.33 each, ₹0.01 remainder → who gets it?
Payer included in split vs payer not included
Single person "split" (should = total amount)
Adding/removing participants mid-calculation

Unequal/Exact Split:

Splits sum to ₹99.50 but expense is ₹100 (₹0.50 missing)
Splits sum to ₹100.50 but expense is ₹100 (₹0.50 extra)
One person owes ₹0 (should they be in split at all?)
Negative amounts entered
Amount exceeds total expense

Percentage Split:

33.33% + 33.33% + 33.33% = 99.99% (missing 0.01%)
25% + 25% + 25% + 26% = 101% (extra 1%)
Someone has 0% (valid but should they be participant?)
Someone has >100%
Percentages entered but don't recalculate when expense amount changes

Shares Split:

1 share + 2 shares + 1 share = 4 total shares
₹100 ÷ 4 shares = ₹25 per share → person with 2 shares owes ₹50
What if someone has 0 shares?
What if shares are fractional (1.5 shares)?

2. Payer Edge Cases

Payer is also a participant (pays ₹100, owes ₹25, net = pays ₹75)
Payer is NOT a participant (simplified payment, tracks who paid but doesn't owe)
Payer is deleted user (expense exists but payer gone)
Multiple payers for same expense (not common but possible)
Payer changes after expense created

3. Group Member Edge Cases
Member Lifecycle:

User joins group with existing unsettled expenses
User leaves group with pending debts (₹500 owed, not paid)
User account deleted but has expense history
User kicked from group vs voluntarily left
Inactive members (haven't opened app in months) with debts

Non-Member Participants:

Guest at dinner (not in app, manual entry)
Friend who paid but isn't registered
How to track settlements with non-members?

4. Settlement Edge Cases
Basic Settlement:

A owes B ₹100, pays ₹50 → still owes ₹50
A owes B ₹100, pays ₹150 → overpaid ₹50 (now B owes A?)
A owes B ₹100, B marks as "forgiven" → debt cleared without payment
Settlement recorded but payment failed/bounced

Debt Simplification:
A owes B ₹100
B owes C ₹100
C owes A ₹100
→ Circular debt, everyone owes ₹0

A owes B ₹100
B owes C ₹150  
C owes A ₹50
→ Simplified: A owes C ₹50, B owes C ₹100
Complex Scenarios:

Multiple debts between same 2 people (A owes B from 5 different expenses)
Settling one expense vs settling entire balance
Group has 10 members, need to minimize total transactions

5. Expense Modification Edge Cases
Before Settlement:

Edit expense amount (₹100 → ₹120) → recalculate all splits
Edit split type (equal → percentage) → completely different amounts
Add new participant → recalculate everyone's share
Remove participant who already owes money

After Partial Settlement:

A owes ₹100, paid ₹50, then expense edited to ₹80 total

Does A still owe ₹50? Or recalculated as ₹40 total so ₹0 owed?


Expense deleted after someone paid

After Full Settlement:

Should you allow editing settled expenses?
If yes, how to handle already-made payments?

6. Group Balance Edge Cases
Balance Calculation:

Net balance for user across all group expenses
User paid ₹500, owes ₹300 → net: should receive ₹200
User paid ₹300, owes ₹500 → net: should pay ₹200
Balance when some expenses settled, some not

Zero Balance Confusion:

A owes B ₹100, B owes A ₹100 → net ₹0 (but 2 transactions exist)
After simplification, balance is ₹0 (debts cancelled out)

7. Data Integrity Edge Cases
Concurrent Operations:

User A adds expense while User B edits same expense
Two users settle same debt simultaneously
User deleted while being added to new expense

Orphaned Data:

Expense with no splits (database inconsistency)
Split with no expense (orphaned record)
User referenced in expense but not in group
Split amounts don't sum to expense total (data corruption)

8. Permission & Access Edge Cases
Who Can Do What:

Can non-payer edit expense? (usually no)
Can admin edit anyone's expense? (usually yes)
Can member leave if they owe money? (should block)
Can you delete group with unsettled debts? (should warn)

Expense Visibility:

Member added after expense creation - can they see it?
Member removed - can they still see old expenses they were in?
Group archived - expense history still visible?

9. Special Expense Scenarios
Self-Payment:

User pays for themselves only (no split needed)
Should this even create a split record?

Full Group Expense:

10 people in group, all 10 split equally every time
Optimization: template/quick split

Partial Group Expense:

10 people in group, only 3 went to dinner
Easy to accidentally include wrong people

Recurring Expenses:

Monthly rent ₹15,000 split equally among 3 roommates
What if someone moves out mid-month?
What if rent increases?

10. Settlement Recording Edge Cases
Payment Methods:

Cash payment (no proof)
Bank transfer (have transaction ID)
UPI/PhonePe (instant, traceable)
"Will pay later" (IOU)

Settlement Disputes:

A says paid ₹100, B says received ₹80
Payment marked but other person denies receiving
Need audit trail/proof of payment

Offline Settlements:

People settle outside app (cash handover)
Manually marking as "settled" in app later
Trust system vs verification system

11. UI/UX Edge Cases
Display Issues:

Very small amounts (₹0.01) - show or hide?
Very large amounts (₹1,50,00,000) - formatting
Long expense descriptions (truncation)
Group with 50+ members (performance)

Notification Hell:

20 expenses added in one day = 20 notifications?
Batch notifications vs individual
Reminder frequency (daily? weekly?)

12. Time-based Edge Cases
Dates:

Expense dated in future (pre-planning)
Expense dated 2 years ago (late entry)
Expense date vs settlement date mismatch
Timezone differences (user in India, expense in USA)

Sorting & Filtering:

"Recent expenses" when 100 old expenses exist
Filter by date range with ongoing debts
"This month" on 1st vs 31st of month


Schema Improvements
prismamodel GroupExpense {
  // Add these critical fields:
  
  // For tracking modifications
  version Int @default(1) // Increment on each edit
  lastModifiedBy String? @map("last_modified_by")
  modificationHistory Json? @map("modification_history")
  
  // For validation
  splitsValidated Boolean @default(false) @map("splits_validated")
  totalSplitAmount Decimal? @map("total_split_amount") @db.Decimal(15, 2)
  
  // For rounding tracking
  roundingAdjustment Decimal @default(0) @map("rounding_adjustment") @db.Decimal(15, 4)
  roundingRecipientUserId String? @map("rounding_recipient_user_id")
  
  // For soft delete
  deletedAt DateTime? @map("deleted_at")
  deletedBy String? @map("deleted_by")
  deletionReason String? @map("deletion_reason")
}

model GroupExpenseSplit {
  // Track calculation details
  calculatedAmount Decimal? @map("calculated_amount") @db.Decimal(15, 2)
  adjustmentAmount Decimal @default(0) @map("adjustment_amount") @db.Decimal(15, 4)
  adjustmentReason String? @map("adjustment_reason")
  
  // For percentage/share splits
  percentage Decimal? @db.Decimal(5, 2)
  shares Decimal? @db.Decimal(10, 2)
  
  // Track payment progress
  paymentHistory Json? @map("payment_history")
  lastPaymentDate DateTime? @map("last_payment_date")
}

model Settlement {
  // Add these fields:
  
  // Settlement details
  paymentMethod String? @map("payment_method")
  transactionId String? @map("transaction_id")
  proofUrl String? @map("proof_url")
  
  // Status tracking
  status String @default("pending") @map("status") 
  // 'pending', 'confirmed', 'disputed', 'cancelled'
  
  confirmedByPayee Boolean @default(false) @map("confirmed_by_payee")
  confirmedByPayer Boolean @default(false) @map("confirmed_by_payer")
  
  disputeReason String? @map("dispute_reason")
  disputedAt DateTime? @map("disputed_at")
  
  // For partial settlements
  isPartialSettlement Boolean @default(false) @map("is_partial_settlement")
  relatedExpenseIds Json? @map("related_expense_ids")
}

// NEW: Track balance snapshots
model GroupBalance {
  id String @id @default(uuid())
  groupId String @map("group_id")
  userId String @map("user_id")
  
  totalPaid Decimal @default(0) @map("total_paid") @db.Decimal(15, 2)
  totalOwed Decimal @default(0) @map("total_owed") @db.Decimal(15, 2)
  netBalance Decimal @default(0) @map("net_balance") @db.Decimal(15, 2)
  // Positive = should receive, Negative = should pay
  
  lastCalculatedAt DateTime @default(now()) @map("last_calculated_at")
  
  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
  @@map("group_balances")
}

// NEW: Audit trail for disputes
model ExpenseAudit {
  id String @id @default(uuid())
  expenseId String @map("expense_id")
  action String // 'created', 'edited', 'deleted', 'settled'
  
  userId String @map("user_id")
  
  oldData Json? @map("old_data")
  newData Json? @map("new_data")
  
  ipAddress String? @map("ip_address")
  userAgent String? @map("user_agent")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([expenseId, createdAt(sort: Desc)])
  @@map("expense_audits")
}

Critical Validation Rules
typescript// 1. Split Sum Validation
function validateSplitSum(expense: GroupExpense, splits: Split[]) {
  const sum = splits.reduce((acc, s) => acc.plus(s.amountOwed), new Decimal(0));
  const diff = sum.minus(expense.amount).abs();
  
  if (diff.greaterThan(0.01)) {
    throw new Error(`Splits sum to ${sum}, expense is ${expense.amount}`);
  }
}

// 2. Percentage Validation
function validatePercentages(splits: Split[]) {
  const sum = splits.reduce((acc, s) => acc + (s.percentage || 0), 0);
  
  if (Math.abs(sum - 100) > 0.01) {
    throw new Error(`Percentages sum to ${sum}%, must be 100%`);
  }
}

// 3. Participant Validation
function validateParticipants(expense: GroupExpense, splits: Split[]) {
  if (splits.length === 0) {
    throw new Error("Must have at least 1 participant");
  }
  
  // Check all participants are in group
  const groupMemberIds = /* fetch from DB */;
  const invalidParticipants = splits.filter(
    s => s.userId && !groupMemberIds.includes(s.userId)
  );
  
  if (invalidParticipants.length > 0) {
    throw new Error("Some participants not in group");
  }
}

// 4. Payment Validation
function validatePayment(split: Split, paymentAmount: Decimal) {
  const newTotal = split.amountPaid.plus(paymentAmount);
  
  if (newTotal.greaterThan(split.amountOwed)) {
    throw new Error(`Overpayment: paying ${paymentAmount}, only owe ${split.amountOwed.minus(split.amountPaid)}`);
  }
}

// 5. Edit Permission Validation
function canEditExpense(expense: GroupExpense, userId: string) {
  // Can't edit if fully settled
  if (expense.isSettled) {
    throw new Error("Cannot edit settled expense");
  }
  
  // Only payer or admin can edit
  if (expense.paidByUserId !== userId && !isAdmin(userId, expense.groupId)) {
    throw new Error("Only payer or admin can edit");
  }
  
  // Can't edit if any partial payments made
  const hasPartialPayments = /* check splits */;
  if (hasPartialPayments) {
    throw new Error("Cannot edit expense with partial payments");
  }
}

Most Critical Edge Cases (Priority Order)

Split sum ≠ expense amount (data corruption)
User leaves group with debts (business logic)
Concurrent expense edits (race condition)
Overpayment handling (user experience)
Debt simplification (core feature)
Partial settlements with edits (complex state)
Orphaned data (referential integrity)
Payer is participant (calculation logic)
Rounding remainders (fairness)
Settlement disputes (trust & verification)

Focus on these first, the rest can be handled incrementally.