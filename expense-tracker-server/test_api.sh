#!/bin/bash
BASE_URL="http://localhost:5000"
OUTPUT="api_test_results.txt"

echo "API Testing Report - $(date)" > $OUTPUT
echo "======================================" >> $OUTPUT

# Login
JOHN_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}' | jq -r '.accessToken')
echo "John Token: ${JOHN_TOKEN:0:20}..." >> $OUTPUT

# Test Analytics
echo -e "\n=== ANALYTICS TESTS ===" >> $OUTPUT
curl -s -X GET "$BASE_URL/analytics/dashboard?period=MONTH" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{keys: keys, summary: .summary}' >> $OUTPUT 2>&1

# Test Loans
echo -e "\n=== LOANS TESTS ===" >> $OUTPUT
curl -s -X GET "$BASE_URL/loans" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{count: (.data | length), total: .total}' >> $OUTPUT 2>&1

curl -s -X GET "$BASE_URL/loans/consolidated" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{directLoans: (.directLoans | length), groupLoans: (.groupLoans | length)}' >> $OUTPUT 2>&1

# Test Groups
echo -e "\n=== GROUPS TESTS ===" >> $OUTPUT
curl -s -X GET "$BASE_URL/groups" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{count: length}' >> $OUTPUT 2>&1

GROUP_ID=$(curl -s -X GET "$BASE_URL/groups" -H "Authorization: Bearer $JOHN_TOKEN" | jq -r '.[0].id // empty')
if [ ! -z "$GROUP_ID" ]; then
  curl -s -X GET "$BASE_URL/groups/$GROUP_ID/balances" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{balances: length}' >> $OUTPUT 2>&1
  curl -s -X GET "$BASE_URL/groups/$GROUP_ID/simplified-debts" -H "Authorization: Bearer $JOHN_TOKEN" | jq -c '{debts: length}' >> $OUTPUT 2>&1
fi

echo -e "\n=== TEST COMPLETE ===" >> $OUTPUT
cat $OUTPUT
