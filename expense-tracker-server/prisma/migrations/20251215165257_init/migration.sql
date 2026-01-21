-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('EXPENSE', 'INCOME', 'GROUP');

-- CreateEnum
CREATE TYPE "UserAvatarStyle" AS ENUM ('adventurer', 'adventurer_neutral', 'thumbs', 'fun_emoji');

-- CreateEnum
CREATE TYPE "GroupIconProvider" AS ENUM ('jdenticon');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT,
    "default_currency" "Currency" NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "profile_picture_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "avatar" TEXT,
    "avatar_seed" TEXT,
    "avatar_style" "UserAvatarStyle" DEFAULT 'adventurer',
    "avatar_url" TEXT,
    "first_name" TEXT,
    "googleId" TEXT,
    "last_name" TEXT,
    "monthly_income_target" DECIMAL(15,2),
    "monthly_expense_target" DECIMAL(15,2),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_password_change" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "type" "CategoryType" NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "parent_category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "original_amount" DECIMAL(15,2),
    "original_currency" TEXT,
    "exchange_rate" DECIMAL(10,4),
    "description" TEXT,
    "expense_date" DATE NOT NULL,
    "payment_method" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern_id" TEXT,
    "receipt_url" TEXT,
    "notes" TEXT,
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(11,8),
    "location_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "auto_detected_category" BOOLEAN NOT NULL DEFAULT false,
    "category_confidence" DOUBLE PRECISION,
    "category_source" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_patterns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "day_of_week" INTEGER,
    "day_of_month" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "next_occurrence" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_expenses" (
    "id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "group_id" TEXT,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "split_type" TEXT NOT NULL,
    "paid_by_user_id" TEXT NOT NULL,
    "description" TEXT,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "split_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_participants" (
    "id" TEXT NOT NULL,
    "split_expense_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_owed" DECIMAL(15,2) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "percentage" DECIMAL(5,2),
    "shares" INTEGER,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "lender_user_id" TEXT NOT NULL,
    "borrower_user_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interest_rate" DECIMAL(5,2) DEFAULT 0,
    "description" TEXT,
    "loan_date" DATE NOT NULL,
    "due_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "amount_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amount_remaining" DECIMAL(15,2) NOT NULL,
    "payment_terms" TEXT,
    "group_id" TEXT,
    "source_type" TEXT NOT NULL DEFAULT 'direct',
    "source_id" TEXT,
    "last_payment_date" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_adjustments" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reason" TEXT,
    "notes" TEXT,
    "payment_method" TEXT,
    "payment_date" DATE,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_user_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "period_type" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "spent_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "alert_threshold" DECIMAL(5,2),
    "allow_rollover" BOOLEAN NOT NULL DEFAULT false,
    "rolled_over_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "action_url" TEXT,
    "action_label" TEXT,
    "image_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "category" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "icon_seed" TEXT,
    "icon_provider" "GroupIconProvider" DEFAULT 'jdenticon',
    "icon_url" TEXT,
    "group_type" TEXT NOT NULL DEFAULT 'other',
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "simplify_debts" BOOLEAN NOT NULL DEFAULT true,
    "allow_non_members" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT DEFAULT 'friends',
    "color" TEXT DEFAULT 'purple',
    "created_by_user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT,
    "contact_id" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "invite_token" TEXT,
    "invite_status" TEXT DEFAULT 'pending',
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" TEXT NOT NULL,
    "description" TEXT,
    "income_date" DATE NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_pattern_id" TEXT,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" DECIMAL(15,2) NOT NULL,
    "current_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "target_date" DATE,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "icon" TEXT,
    "color" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_contributions" (
    "id" TEXT NOT NULL,
    "savings_goal_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "contribution_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "date_format" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "time_format" TEXT NOT NULL DEFAULT '24h',
    "week_start_day" TEXT NOT NULL DEFAULT 'monday',
    "default_view" TEXT NOT NULL DEFAULT 'dashboard',
    "text_size" TEXT NOT NULL DEFAULT 'medium',
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "budget_alerts" BOOLEAN NOT NULL DEFAULT true,
    "subscription_reminders" BOOLEAN NOT NULL DEFAULT true,
    "loan_reminders" BOOLEAN NOT NULL DEFAULT true,
    "export_format" TEXT NOT NULL DEFAULT 'pdf',
    "biometric_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_backup" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_expenses" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "paid_by_user_id" TEXT,
    "paid_by_name" TEXT,
    "category_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "description" TEXT NOT NULL,
    "expense_date" DATE NOT NULL,
    "notes" TEXT,
    "receipt_url" TEXT,
    "split_type" TEXT NOT NULL DEFAULT 'equal',
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "split_validation_status" TEXT DEFAULT 'valid',
    "has_adjustments" BOOLEAN NOT NULL DEFAULT false,
    "adjustment_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "last_modified_by" TEXT,
    "last_modified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_expense_splits" (
    "id" TEXT NOT NULL,
    "group_expense_id" TEXT NOT NULL,
    "user_id" TEXT,
    "member_name" TEXT,
    "amount_owed" DECIMAL(15,2) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "percentage" DECIMAL(5,2),
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_expense_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "settled_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "loan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_is_active_is_deleted_idx" ON "users"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "users"("last_login_at");

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "categories_is_system_idx" ON "categories"("is_system");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE INDEX "categories_parent_category_id_idx" ON "categories"("parent_category_id");

-- CreateIndex
CREATE INDEX "categories_user_id_is_system_idx" ON "categories"("user_id", "is_system");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");

-- CreateIndex
CREATE INDEX "expenses_user_id_expense_date_idx" ON "expenses"("user_id", "expense_date" DESC);

-- CreateIndex
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_deleted_at_idx" ON "expenses"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "expenses_user_id_category_id_expense_date_idx" ON "expenses"("user_id", "category_id", "expense_date");

-- CreateIndex
CREATE INDEX "expenses_user_id_is_recurring_idx" ON "expenses"("user_id", "is_recurring");

-- CreateIndex
CREATE INDEX "expenses_recurring_pattern_id_idx" ON "expenses"("recurring_pattern_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_currency_idx" ON "expenses"("user_id", "currency");

-- CreateIndex
CREATE INDEX "expenses_payment_method_idx" ON "expenses"("payment_method");

-- CreateIndex
CREATE INDEX "expenses_user_id_created_at_idx" ON "expenses"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "recurring_patterns_user_id_is_active_idx" ON "recurring_patterns"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "recurring_patterns_next_occurrence_is_active_idx" ON "recurring_patterns"("next_occurrence", "is_active");

-- CreateIndex
CREATE INDEX "recurring_patterns_frequency_idx" ON "recurring_patterns"("frequency");

-- CreateIndex
CREATE INDEX "recurring_patterns_user_id_frequency_is_active_idx" ON "recurring_patterns"("user_id", "frequency", "is_active");

-- CreateIndex
CREATE INDEX "split_expenses_paid_by_user_id_idx" ON "split_expenses"("paid_by_user_id");

-- CreateIndex
CREATE INDEX "split_expenses_is_settled_idx" ON "split_expenses"("is_settled");

-- CreateIndex
CREATE INDEX "split_expenses_expense_id_idx" ON "split_expenses"("expense_id");

-- CreateIndex
CREATE INDEX "split_expenses_group_id_idx" ON "split_expenses"("group_id");

-- CreateIndex
CREATE INDEX "split_expenses_paid_by_user_id_is_settled_idx" ON "split_expenses"("paid_by_user_id", "is_settled");

-- CreateIndex
CREATE INDEX "split_expenses_group_id_is_settled_idx" ON "split_expenses"("group_id", "is_settled");

-- CreateIndex
CREATE INDEX "split_expenses_created_at_idx" ON "split_expenses"("created_at" DESC);

-- CreateIndex
CREATE INDEX "split_participants_user_id_is_settled_idx" ON "split_participants"("user_id", "is_settled");

-- CreateIndex
CREATE INDEX "split_participants_split_expense_id_idx" ON "split_participants"("split_expense_id");

-- CreateIndex
CREATE INDEX "split_participants_user_id_idx" ON "split_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "split_participants_split_expense_id_user_id_key" ON "split_participants"("split_expense_id", "user_id");

-- CreateIndex
CREATE INDEX "loans_lender_user_id_status_idx" ON "loans"("lender_user_id", "status");

-- CreateIndex
CREATE INDEX "loans_borrower_user_id_status_idx" ON "loans"("borrower_user_id", "status");

-- CreateIndex
CREATE INDEX "loans_due_date_idx" ON "loans"("due_date");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_lender_user_id_due_date_idx" ON "loans"("lender_user_id", "due_date");

-- CreateIndex
CREATE INDEX "loans_borrower_user_id_due_date_idx" ON "loans"("borrower_user_id", "due_date");

-- CreateIndex
CREATE INDEX "loans_loan_date_idx" ON "loans"("loan_date");

-- CreateIndex
CREATE INDEX "loans_group_id_idx" ON "loans"("group_id");

-- CreateIndex
CREATE INDEX "loans_source_type_idx" ON "loans"("source_type");

-- CreateIndex
CREATE INDEX "loans_lender_user_id_is_deleted_idx" ON "loans"("lender_user_id", "is_deleted");

-- CreateIndex
CREATE INDEX "loans_borrower_user_id_is_deleted_idx" ON "loans"("borrower_user_id", "is_deleted");

-- CreateIndex
CREATE INDEX "loan_adjustments_loan_id_created_at_idx" ON "loan_adjustments"("loan_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "loan_adjustments_adjustment_type_idx" ON "loan_adjustments"("adjustment_type");

-- CreateIndex
CREATE INDEX "loan_adjustments_created_by_idx" ON "loan_adjustments"("created_by");

-- CreateIndex
CREATE INDEX "user_contacts_user_id_idx" ON "user_contacts"("user_id");

-- CreateIndex
CREATE INDEX "user_contacts_contact_user_id_idx" ON "user_contacts"("contact_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_contacts_user_id_contact_user_id_key" ON "user_contacts"("user_id", "contact_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_contacts_user_id_contact_email_key" ON "user_contacts"("user_id", "contact_email");

-- CreateIndex
CREATE INDEX "budgets_user_id_is_active_idx" ON "budgets"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");

-- CreateIndex
CREATE INDEX "budgets_user_id_period_type_is_active_idx" ON "budgets"("user_id", "period_type", "is_active");

-- CreateIndex
CREATE INDEX "budgets_start_date_end_date_idx" ON "budgets"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "budgets_user_id_start_date_end_date_idx" ON "budgets"("user_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_related_entity_type_related_entity_id_idx" ON "notifications"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_priority_is_read_idx" ON "notifications"("user_id", "priority", "is_read");

-- CreateIndex
CREATE INDEX "groups_created_by_user_id_idx" ON "groups"("created_by_user_id");

-- CreateIndex
CREATE INDEX "groups_is_active_idx" ON "groups"("is_active");

-- CreateIndex
CREATE INDEX "groups_is_archived_idx" ON "groups"("is_archived");

-- CreateIndex
CREATE INDEX "groups_group_type_idx" ON "groups"("group_type");

-- CreateIndex
CREATE INDEX "groups_currency_idx" ON "groups"("currency");

-- CreateIndex
CREATE INDEX "groups_created_at_idx" ON "groups"("created_at" DESC);

-- CreateIndex
CREATE INDEX "groups_created_by_user_id_is_active_idx" ON "groups"("created_by_user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_invite_token_key" ON "group_members"("invite_token");

-- CreateIndex
CREATE INDEX "group_members_group_id_idx" ON "group_members"("group_id");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE INDEX "group_members_contact_id_idx" ON "group_members"("contact_id");

-- CreateIndex
CREATE INDEX "group_members_invite_status_idx" ON "group_members"("invite_status");

-- CreateIndex
CREATE INDEX "group_members_group_id_invite_status_idx" ON "group_members"("group_id", "invite_status");

-- CreateIndex
CREATE INDEX "group_members_group_id_role_idx" ON "group_members"("group_id", "role");

-- CreateIndex
CREATE INDEX "group_members_invite_token_idx" ON "group_members"("invite_token");

-- CreateIndex
CREATE INDEX "group_members_group_id_user_id_invite_status_idx" ON "group_members"("group_id", "user_id", "invite_status");

-- CreateIndex
CREATE INDEX "group_members_user_id_invite_status_idx" ON "group_members"("user_id", "invite_status");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_user_id_key" ON "group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "incomes_user_id_income_date_idx" ON "incomes"("user_id", "income_date" DESC);

-- CreateIndex
CREATE INDEX "incomes_category_id_idx" ON "incomes"("category_id");

-- CreateIndex
CREATE INDEX "incomes_user_id_deleted_at_idx" ON "incomes"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "incomes_user_id_source_idx" ON "incomes"("user_id", "source");

-- CreateIndex
CREATE INDEX "incomes_user_id_is_recurring_idx" ON "incomes"("user_id", "is_recurring");

-- CreateIndex
CREATE INDEX "incomes_recurring_pattern_id_idx" ON "incomes"("recurring_pattern_id");

-- CreateIndex
CREATE INDEX "incomes_user_id_category_id_idx" ON "incomes"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "incomes_income_date_idx" ON "incomes"("income_date");

-- CreateIndex
CREATE INDEX "savings_goals_user_id_is_completed_is_archived_idx" ON "savings_goals"("user_id", "is_completed", "is_archived");

-- CreateIndex
CREATE INDEX "savings_goals_user_id_target_date_idx" ON "savings_goals"("user_id", "target_date");

-- CreateIndex
CREATE INDEX "savings_goals_user_id_priority_idx" ON "savings_goals"("user_id", "priority");

-- CreateIndex
CREATE INDEX "savings_goals_user_id_created_at_idx" ON "savings_goals"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "savings_goals_is_completed_is_archived_idx" ON "savings_goals"("is_completed", "is_archived");

-- CreateIndex
CREATE INDEX "savings_contributions_savings_goal_id_contribution_date_idx" ON "savings_contributions"("savings_goal_id", "contribution_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "group_expenses_group_id_idx" ON "group_expenses"("group_id");

-- CreateIndex
CREATE INDEX "group_expenses_paid_by_user_id_idx" ON "group_expenses"("paid_by_user_id");

-- CreateIndex
CREATE INDEX "group_expenses_expense_date_idx" ON "group_expenses"("expense_date");

-- CreateIndex
CREATE INDEX "group_expenses_is_settled_idx" ON "group_expenses"("is_settled");

-- CreateIndex
CREATE INDEX "group_expenses_category_id_idx" ON "group_expenses"("category_id");

-- CreateIndex
CREATE INDEX "group_expenses_split_validation_status_idx" ON "group_expenses"("split_validation_status");

-- CreateIndex
CREATE INDEX "group_expenses_group_id_expense_date_idx" ON "group_expenses"("group_id", "expense_date" DESC);

-- CreateIndex
CREATE INDEX "group_expenses_group_id_is_settled_idx" ON "group_expenses"("group_id", "is_settled");

-- CreateIndex
CREATE INDEX "group_expense_splits_group_expense_id_idx" ON "group_expense_splits"("group_expense_id");

-- CreateIndex
CREATE INDEX "group_expense_splits_user_id_idx" ON "group_expense_splits"("user_id");

-- CreateIndex
CREATE INDEX "group_expense_splits_is_paid_idx" ON "group_expense_splits"("is_paid");

-- CreateIndex
CREATE INDEX "group_expense_splits_group_expense_id_user_id_idx" ON "group_expense_splits"("group_expense_id", "user_id");

-- CreateIndex
CREATE INDEX "group_expense_splits_user_id_is_paid_idx" ON "group_expense_splits"("user_id", "is_paid");

-- CreateIndex
CREATE UNIQUE INDEX "group_expense_splits_group_expense_id_user_id_key" ON "group_expense_splits"("group_expense_id", "user_id");

-- CreateIndex
CREATE INDEX "settlements_group_id_idx" ON "settlements"("group_id");

-- CreateIndex
CREATE INDEX "settlements_from_user_id_idx" ON "settlements"("from_user_id");

-- CreateIndex
CREATE INDEX "settlements_to_user_id_idx" ON "settlements"("to_user_id");

-- CreateIndex
CREATE INDEX "settlements_settled_at_idx" ON "settlements"("settled_at");

-- CreateIndex
CREATE INDEX "settlements_loan_id_idx" ON "settlements"("loan_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurring_pattern_id_fkey" FOREIGN KEY ("recurring_pattern_id") REFERENCES "recurring_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_patterns" ADD CONSTRAINT "recurring_patterns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_expenses" ADD CONSTRAINT "split_expenses_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_expenses" ADD CONSTRAINT "split_expenses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_expenses" ADD CONSTRAINT "split_expenses_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_expenses" ADD CONSTRAINT "split_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_participants" ADD CONSTRAINT "split_participants_split_expense_id_fkey" FOREIGN KEY ("split_expense_id") REFERENCES "split_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_participants" ADD CONSTRAINT "split_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_user_id_fkey" FOREIGN KEY ("borrower_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_lender_user_id_fkey" FOREIGN KEY ("lender_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_adjustments" ADD CONSTRAINT "loan_adjustments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_adjustments" ADD CONSTRAINT "loan_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_contact_user_id_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "user_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_recurring_pattern_id_fkey" FOREIGN KEY ("recurring_pattern_id") REFERENCES "recurring_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_splits" ADD CONSTRAINT "group_expense_splits_group_expense_id_fkey" FOREIGN KEY ("group_expense_id") REFERENCES "group_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_splits" ADD CONSTRAINT "group_expense_splits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
