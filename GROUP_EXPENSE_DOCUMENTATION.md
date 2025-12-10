# Group Expense System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Split Methods](#split-methods)
4. [Balance Calculation](#balance-calculation)
5. [Debt Simplification (Greedy Algorithm)](#debt-simplification-greedy-algorithm)
6. [Scenarios with Examples](#scenarios-with-examples)
7. [API Endpoints](#api-endpoints)

---

## Overview

The Group Expense System allows multiple people to share expenses and automatically calculates who owes whom. It uses a **greedy algorithm** (same as Splitwise) to minimize the number of transactions needed to settle all debts.

### Key Features
- ✅ Multiple split methods (Equal, Exact, Percentage, Shares)
- ✅ Automatic balance calculation
- ✅ Debt simplification to minimize transactions
- ✅ Support for 2-50+ people per group
- ✅ Handles rounding automatically

---

## Core Concepts

### 1. The Two Tracking Systems

The system tracks two separate things:

#### A. Who Paid the Expense Upfront
- Tracked by: `paidByUserId` on the `GroupExpense` table
- Example: Alice paid ₹1,200 for hotel

#### B. Who Owes What Share
- Tracked by: `amountOwed` on the `GroupExpenseSplit` table
- Example: Each person owes ₹300 (if split 4 ways)

**Important**: `amountPaid` on splits tracks **repayments**, NOT the initial payment!

```typescript
// ❌ WRONG - Don't confuse these!
amountPaid = full expense amount (for payer)

// ✅ CORRECT
amountPaid = 0 (initially for everyone)
// amountPaid increases only when someone settles their debt
```

### 2. Balance Calculation Formula

```
User Balance = Total Paid - Total Owed

Positive Balance = User should RECEIVE money (they lent)
Negative Balance = User should PAY money (they borrowed)
Zero Balance = User is settled up
```

**Example**:
- Alice paid ₹1,200, owes ₹300 → Balance = +₹900 (receives)
- Bob paid ₹0, owes ₹300 → Balance = -₹300 (pays)

---

## Split Methods

### 1. Equal Split

**Use Case**: Everyone pays the same amount

**Example**: ₹1,200 hotel split among 4 people

```json
{
  "amount": 1200,
  "splitType": "equal",
  "participants": [
    {"userId": "alice"},
    {"userId": "bob"},
    {"userId": "carol"},
    {"userId": "dave"}
  ]
}
```

**Result**:
- Each person owes: ₹1,200 ÷ 4 = **₹300**

**Rounding Handling**:
- ₹100 ÷ 3 = ₹33.33 each
- Remainder ₹0.01 goes to the payer (or first participant)

---

### 2. Exact/Unequal Split

**Use Case**: Different people owe different amounts

**Example**: Dinner where people ordered different items

```json
{
  "amount": 1000,
  "splitType": "exact",
  "participants": [
    {"userId": "alice", "amount": 400},
    {"userId": "bob", "amount": 350},
    {"userId": "carol", "amount": 250}
  ]
}
```

**Result**:
- Alice owes: ₹400
- Bob owes: ₹350
- Carol owes: ₹250
- Total: ₹1,000 ✅

**Validation**: Sum must equal total expense (within ₹0.01 tolerance)

---

### 3. Percentage Split

**Use Case**: Split by ownership percentage or income ratio

**Example**: Rent split by room size

```json
{
  "amount": 15000,
  "splitType": "percentage",
  "participants": [
    {"userId": "alice", "percentage": 40},
    {"userId": "bob", "percentage": 35},
    {"userId": "carol", "percentage": 25}
  ]
}
```

**Result**:
- Alice owes: 40% of ₹15,000 = **₹6,000**
- Bob owes: 35% of ₹15,000 = **₹5,250**
- Carol owes: 25% of ₹15,000 = **₹3,750**

**Validation**: Percentages must sum to 100% (within 0.01% tolerance)

---

### 4. Shares Split

**Use Case**: When people have different "weights" (e.g., adults vs kids)

**Example**: Vacation cost where couples count as 2 shares

```json
{
  "amount": 10000,
  "splitType": "shares",
  "participants": [
    {"userId": "alice", "shares": 2},    // Couple
    {"userId": "bob", "shares": 2},      // Couple
    {"userId": "carol", "shares": 1}     // Single
  ]
}
```

**Calculation**:
- Total shares: 2 + 2 + 1 = 5
- Per share: ₹10,000 ÷ 5 = ₹2,000

**Result**:
- Alice owes: 2 × ₹2,000 = **₹4,000**
- Bob owes: 2 × ₹2,000 = **₹4,000**
- Carol owes: 1 × ₹2,000 = **₹2,000**

---

## Balance Calculation

### How It Works

For each expense:
1. Add expense amount to payer's `totalPaid`
2. Add each person's share to their `totalOwed`
3. Calculate balance: `totalPaid - totalOwed`

### Example: Multiple Expenses

**Group**: Alice, Bob, Carol

**Expense 1**: Alice paid ₹1,200 for hotel (split equally)
```
Alice: totalPaid = ₹1,200, totalOwed = ₹400, balance = +₹800
Bob:   totalPaid = ₹0,     totalOwed = ₹400, balance = -₹400
Carol: totalPaid = ₹0,     totalOwed = ₹400, balance = -₹400
```

**Expense 2**: Bob paid ₹900 for dinner (split equally)
```
Alice: totalPaid = ₹1,200, totalOwed = ₹700, balance = +₹500
Bob:   totalPaid = ₹900,   totalOwed = ₹700, balance = +₹200
Carol: totalPaid = ₹0,     totalOwed = ₹700, balance = -₹700
```

**Expense 3**: Carol paid ₹600 for gas (split equally)
```
Alice: totalPaid = ₹1,200, totalOwed = ₹900, balance = +₹300
Bob:   totalPaid = ₹900,   totalOwed = ₹900, balance = ₹0
Carol: totalPaid = ₹600,   totalOwed = ₹900, balance = -₹300
```

**Final Balances**:
- Alice: +₹300 (should receive)
- Bob: ₹0 (settled)
- Carol: -₹300 (should pay)

**Simplified Debt**: Carol → Alice: ₹300 (1 transaction!)

---

## Debt Simplification (Greedy Algorithm)

### The Problem

Without simplification, you'd need many transactions:

**Example**: 4 people, 12 expenses
- Potential transactions: Up to 12 transactions
- With simplification: Usually 3 transactions (n-1 where n = people)

### Greedy Algorithm Steps

```
1. Calculate net balance for each person
2. Separate into:
   - Creditors (positive balance) - sorted largest first
   - Debtors (negative balance) - sorted largest first
3. Match largest debtor with largest creditor
4. Settle as much as possible
5. Move to next pair
6. Repeat until all settled
```

### Time Complexity
- **O(n log n)** where n = number of people
- Sorting is the bottleneck

### Example Walkthrough

**Balances**:
- Alice: +₹900 (creditor)
- Bob: +₹400 (creditor)
- Carol: -₹200 (debtor)
- Dave: -₹600 (debtor)
- Eve: -₹500 (debtor)

**Step 1**: Sort
- Creditors: [Alice: ₹900, Bob: ₹400]
- Debtors: [Dave: ₹600, Eve: ₹500, Carol: ₹200]

**Step 2**: Match Dave (₹600) with Alice (₹900)
- Dave pays Alice: min(₹600, ₹900) = **₹600**
- Dave: ₹0 (settled)
- Alice: ₹300 remaining

**Step 3**: Match Eve (₹500) with Alice (₹300)
- Eve pays Alice: min(₹500, ₹300) = **₹300**
- Alice: ₹0 (settled)
- Eve: ₹200 remaining

**Step 4**: Match Eve (₹200) with Bob (₹400)
- Eve pays Bob: min(₹200, ₹400) = **₹200**
- Eve: ₹0 (settled)
- Bob: ₹200 remaining

**Step 5**: Match Carol (₹200) with Bob (₹200)
- Carol pays Bob: **₹200**
- Both settled

**Final Result**: 4 transactions
1. Dave → Alice: ₹600
2. Eve → Alice: ₹300
3. Eve → Bob: ₹200
4. Carol → Bob: ₹200

---

## Scenarios with Examples

### Scenario 1: Weekend Trip (3 People)

**Group**: Alice, Bob, Carol

**Day 1 - Hotel**: Alice paid ₹3,600 (equal split)
```
Each owes: ₹1,200
Alice: totalPaid = ₹3,600, totalOwed = ₹1,200, balance = +₹2,400
Bob:   totalPaid = ₹0,     totalOwed = ₹1,200, balance = -₹1,200
Carol: totalPaid = ₹0,     totalOwed = ₹1,200, balance = -₹1,200
```

**Day 2 - Breakfast**: Bob paid ₹600 (equal split)
```
Each owes: ₹200
Alice: totalPaid = ₹3,600, totalOwed = ₹1,400, balance = +₹2,200
Bob:   totalPaid = ₹600,   totalOwed = ₹1,400, balance = -₹800
Carol: totalPaid = ₹0,     totalOwed = ₹1,400, balance = -₹1,400
```

**Day 2 - Lunch**: Carol paid ₹900 (equal split)
```
Each owes: ₹300
Alice: totalPaid = ₹3,600, totalOwed = ₹1,700, balance = +₹1,900
Bob:   totalPaid = ₹600,   totalOwed = ₹1,700, balance = -₹1,100
Carol: totalPaid = ₹900,   totalOwed = ₹1,700, balance = -₹800
```

**Day 3 - Dinner**: Alice paid ₹1,500 (exact split)
```
Alice: ₹600, Bob: ₹500, Carol: ₹400
Alice: totalPaid = ₹5,100, totalOwed = ₹2,300, balance = +₹2,800
Bob:   totalPaid = ₹600,   totalOwed = ₹2,200, balance = -₹1,600
Carol: totalPaid = ₹900,   totalOwed = ₹2,100, balance = -₹1,200
```

**Simplified Debts** (Greedy Algorithm):
1. **Bob → Alice: ₹1,600**
2. **Carol → Alice: ₹1,200**

**Total**: 2 transactions instead of 8!

---

### Scenario 2: Shared Apartment (5 People)

**Group**: Alice, Bob, Carol, Dave, Eve

**Month 1 Expenses**:

**Rent**: Alice paid ₹25,000 (percentage split by room size)
```
Alice: 30%, Bob: 25%, Carol: 20%, Dave: 15%, Eve: 10%
Alice: totalPaid = ₹25,000, totalOwed = ₹7,500,  balance = +₹17,500
Bob:   totalPaid = ₹0,      totalOwed = ₹6,250,  balance = -₹6,250
Carol: totalPaid = ₹0,      totalOwed = ₹5,000,  balance = -₹5,000
Dave:  totalPaid = ₹0,      totalOwed = ₹3,750,  balance = -₹3,750
Eve:   totalPaid = ₹0,      totalOwed = ₹2,500,  balance = -₹2,500
```

**Electricity**: Bob paid ₹2,000 (equal split)
```
Each owes: ₹400
Alice: totalPaid = ₹25,000, totalOwed = ₹7,900,  balance = +₹17,100
Bob:   totalPaid = ₹2,000,  totalOwed = ₹6,650,  balance = -₹4,650
Carol: totalPaid = ₹0,      totalOwed = ₹5,400,  balance = -₹5,400
Dave:  totalPaid = ₹0,      totalOwed = ₹4,150,  balance = -₹4,150
Eve:   totalPaid = ₹0,      totalOwed = ₹2,900,  balance = -₹2,900
```

**Internet**: Carol paid ₹1,500 (equal split)
```
Each owes: ₹300
Alice: totalPaid = ₹25,000, totalOwed = ₹8,200,  balance = +₹16,800
Bob:   totalPaid = ₹2,000,  totalOwed = ₹6,950,  balance = -₹4,950
Carol: totalPaid = ₹1,500,  totalOwed = ₹5,700,  balance = -₹4,200
Dave:  totalPaid = ₹0,      totalOwed = ₹4,450,  balance = -₹4,450
Eve:   totalPaid = ₹0,      totalOwed = ₹3,200,  balance = -₹3,200
```

**Groceries**: Dave paid ₹3,000 (shares: Alice=2, others=1 each)
```
Total shares: 6, Per share: ₹500
Alice: 2 shares = ₹1,000
Others: 1 share = ₹500 each
Alice: totalPaid = ₹25,000, totalOwed = ₹9,200,  balance = +₹15,800
Bob:   totalPaid = ₹2,000,  totalOwed = ₹7,450,  balance = -₹5,450
Carol: totalPaid = ₹1,500,  totalOwed = ₹6,200,  balance = -₹4,700
Dave:  totalPaid = ₹3,000,  totalOwed = ₹4,950,  balance = -₹1,950
Eve:   totalPaid = ₹0,      totalOwed = ₹3,700,  balance = -₹3,700
```

**Simplified Debts** (Greedy Algorithm):
1. **Bob → Alice: ₹5,450**
2. **Carol → Alice: ₹4,700**
3. **Eve → Alice: ₹3,700**
4. **Dave → Alice: ₹1,950**

**Total**: 4 transactions (n-1 where n=5)

---

### Scenario 3: Dinner Party (3 People, Unequal Split)

**Group**: Alice, Bob, Carol

**Dinner Bill**: ₹2,500 paid by Alice

**Items Ordered**:
- Alice: ₹1,200 (steak + wine)
- Bob: ₹800 (pasta + beer)
- Carol: ₹500 (salad + water)

```json
{
  "amount": 2500,
  "paidByUserId": "alice",
  "splitType": "exact",
  "participants": [
    {"userId": "alice", "amount": 1200},
    {"userId": "bob", "amount": 800},
    {"userId": "carol", "amount": 500}
  ]
}
```

**Balances**:
```
Alice: totalPaid = ₹2,500, totalOwed = ₹1,200, balance = +₹1,300
Bob:   totalPaid = ₹0,     totalOwed = ₹800,   balance = -₹800
Carol: totalPaid = ₹0,     totalOwed = ₹500,   balance = -₹500
```

**Simplified Debts**:
1. **Bob → Alice: ₹800**
2. **Carol → Alice: ₹500**

---

## API Endpoints

### 1. Create Group Expense

```http
POST /api/groups/:groupId/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1200,
  "description": "Hotel booking",
  "paidByUserId": "alice-id",
  "splitType": "equal",
  "categoryId": "accommodation-id",
  "participants": [
    {"userId": "alice-id"},
    {"userId": "bob-id"},
    {"userId": "carol-id"}
  ]
}
```

### 2. Get Group Balances

```http
GET /api/groups/:groupId/balances
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "userId": "alice-id",
      "totalPaid": 5100,
      "totalOwed": 2300,
      "balance": 2800,
      "formatted": {
        "text": "gets back ₹2,800.00",
        "color": "green"
      }
    }
  ]
}
```

### 3. Get Simplified Debts

```http
GET /api/groups/:groupId/balances/simplified
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "fromUserId": "bob-id",
      "toUserId": "alice-id",
      "amount": 1600,
      "fromUser": {
        "firstName": "Bob",
        "lastName": "Smith"
      },
      "toUser": {
        "firstName": "Alice",
        "lastName": "Johnson"
      }
    }
  ]
}
```

### 4. Settle Expense

```http
POST /api/groups/:groupId/expenses/:expenseId/settle
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "bob-id",
  "amount": 400,
  "markAsFullyPaid": false
}
```

---

## Best Practices

### 1. Always Use Correct Split Type
- **Equal**: Default for most shared expenses
- **Exact**: When people ordered different items
- **Percentage**: For recurring bills (rent, utilities)
- **Shares**: For weighted splits (adults vs kids)

### 2. Validate Before Submitting
- Exact splits must sum to total
- Percentages must sum to 100%
- All participants must be group members

### 3. Handle Rounding
- System automatically handles rounding
- Remainder goes to payer or first participant
- Tolerance: ₹0.01 for amounts, 0.01% for percentages

### 4. Regular Settlements
- Settle debts regularly to avoid large balances
- Use simplified debts view to minimize transactions
- Record settlements in the system for tracking

---

## Common Questions

### Q: Why is my balance different after someone else paid?

**A**: When someone pays an expense you're part of, your `totalOwed` increases, which decreases your balance.

**Example**:
- Before: You paid ₹1,000, owe ₹500 → Balance = +₹500
- Friend pays ₹600 split 3 ways (you owe ₹200 more)
- After: You paid ₹1,000, owe ₹700 → Balance = +₹300

### Q: Can simplified debts change without new expenses?

**A**: No! Simplified debts only change when:
1. New expense is added
2. Existing expense is edited
3. Someone settles a debt

### Q: Why doesn't everyone pay the person who paid most?

**A**: The greedy algorithm optimizes for **minimum transactions**, not simplicity. Sometimes it's more efficient for person A to pay person B, even if person C paid the most.

### Q: What if someone leaves the group with debts?

**A**: The system prevents leaving if balance is negative (owes money). They must settle first.

---

## Technical Implementation

### Database Schema

```prisma
model GroupExpense {
  id           String
  groupId      String
  paidByUserId String  // Who paid upfront
  amount       Decimal
  splitType    String  // equal, exact, percentage, shares
  splits       GroupExpenseSplit[]
}

model GroupExpenseSplit {
  id             String
  groupExpenseId String
  userId         String
  amountOwed     Decimal  // Their share
  amountPaid     Decimal  // How much they've repaid (starts at 0)
  isPaid         Boolean
}
```

### Balance Calculation Service

```typescript
calculateGroupBalances(expenses) {
  const balances = new Map();
  
  expenses.forEach(expense => {
    // Add to payer's totalPaid
    balances.get(expense.paidByUserId).totalPaid += expense.amount;
    
    // Add to each participant's totalOwed
    expense.splits.forEach(split => {
      balances.get(split.userId).totalOwed += split.amountOwed;
    });
  });
  
  // Calculate balance = totalPaid - totalOwed
  balances.forEach(member => {
    member.balance = member.totalPaid - member.totalOwed;
  });
  
  return balances;
}
```

### Debt Settlement Service

```typescript
simplifyDebts(balances) {
  const creditors = balances.filter(b => b.balance > 0).sort(desc);
  const debtors = balances.filter(b => b.balance < 0).sort(desc);
  
  const settlements = [];
  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].balance, creditors[j].balance);
    
    settlements.push({
      from: debtors[i].userId,
      to: creditors[j].userId,
      amount: amount
    });
    
    debtors[i].balance -= amount;
    creditors[j].balance -= amount;
    
    if (debtors[i].balance < 0.01) i++;
    if (creditors[j].balance < 0.01) j++;
  }
  
  return settlements;
}
```

---

## Troubleshooting

### Issue: Balances showing as null or NaN

**Cause**: Prisma Decimal type not converted to number

**Solution**: Use `Number()` conversion
```typescript
const amount = Number(expense.amount);
const owedAmount = Number(split.amountOwed);
```

### Issue: Splits don't sum to total

**Cause**: Rounding errors or incorrect input

**Solution**: System validates within ₹0.01 tolerance
```typescript
const diff = Math.abs(sum - total);
if (diff > 0.01) throw new Error('Sum mismatch');
```

### Issue: Simplified debts are empty

**Cause**: Everyone has zero balance (all settled)

**Solution**: This is correct! No transactions needed.

---

## Conclusion

The Group Expense System provides a robust, scalable solution for managing shared expenses. By using the greedy algorithm for debt simplification, it minimizes the number of transactions needed while maintaining accuracy and fairness.

**Key Takeaways**:
- 4 split methods for different scenarios
- Automatic balance calculation
- Greedy algorithm minimizes transactions
- Handles 2-50+ people efficiently
- Production-ready with proper validation

For more details, see the [API Documentation](./API.md) and [Implementation Guide](./walkthrough.md).
