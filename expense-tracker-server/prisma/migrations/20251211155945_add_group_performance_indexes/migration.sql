-- CreateIndex
CREATE INDEX "group_expense_splits_group_expense_id_user_id_idx" ON "group_expense_splits"("group_expense_id", "user_id");

-- CreateIndex
CREATE INDEX "group_expense_splits_user_id_is_paid_idx" ON "group_expense_splits"("user_id", "is_paid");

-- CreateIndex
CREATE INDEX "group_expenses_group_id_expense_date_idx" ON "group_expenses"("group_id", "expense_date" DESC);

-- CreateIndex
CREATE INDEX "group_expenses_group_id_is_settled_idx" ON "group_expenses"("group_id", "is_settled");

-- CreateIndex
CREATE INDEX "group_members_group_id_user_id_invite_status_idx" ON "group_members"("group_id", "user_id", "invite_status");

-- CreateIndex
CREATE INDEX "group_members_user_id_invite_status_idx" ON "group_members"("user_id", "invite_status");
