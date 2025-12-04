# EXPENZY Project File Structure

This document provides a comprehensive overview of the EXPENZY project structure to help AI understand the purpose of each file/directory and prevent code duplication.

## Project Overview
- **Frontend**: Next.js 14+ (App Router) with TypeScript, React Query, and Tailwind CSS
- **Backend**: NestJS with Prisma ORM (located in `../expense-tracker-server`)

---

## 📁 Core Directories

### `/app` - Next.js App Router Pages
All route-based pages using Next.js 14+ App Router pattern.

- **`/app/api/auth/`** - NextAuth.js authentication API routes
- **`/app/dashboard/`** - Main dashboard pages (protected routes)
  - `page.tsx` - Dashboard home/overview page with stats and charts
  - `layout.tsx` - Shared dashboard layout with sidebar/header
  - `/transactions/page.tsx` - Transaction list with filters, search & pagination
  - `/budget/page.tsx` - Budget management and tracking
  - `/analytics/page.tsx` - Analytics, insights & spending trends
  - `/loans/page.tsx` - Loan tracking (lent/borrowed money)
  - `/groups/page.tsx` - Group expense splitting
  - `/savings/page.tsx` - Savings goals management
  - `/subscriptions/page.tsx` - Recurring subscriptions tracking
  - `/accounts/page.tsx` - Bank account management
  - `/payment-methods/page.tsx` - Payment method management
  - `/tags/page.tsx` - Tag organization for transactions
  - `/notifications/page.tsx` - Notification center
  - `/profile/page.tsx` - User profile & settings
- **`/app/login/`** - Login page (public)
- **`/app/signup/`** - Signup page (public)
- **`/app/globals.css`** - Global styles & Tailwind imports
- **`/app/layout.tsx`** - Root layout with providers
- **`/app/page.tsx`** - Landing page (redirects to dashboard if logged in)

---

### `/components` - React Components
Organized by component type for reusability.

#### `/components/features/` - Feature-Specific Components
Complex components tied to specific features:
- `expense-modal.tsx` - Expense creation/edit modal (legacy)
- `income-modal.tsx` - Income creation/edit modal (legacy)
- `/profile/*` - Profile page sections:
  - `appearance-section.tsx` - Theme and display preferences
  - `notification-settings.tsx` - Notification preferences
  - `privacy-section.tsx` - Privacy settings
  - `security-section.tsx` - Password and security
  - `profile-header.tsx` - Profile header with avatar
  - `profile-info.tsx` - Basic profile information
  - `account-section.tsx` - Account management
  - `preferences-section.tsx` - User preferences
  - `data-export.tsx` - Export user data

#### `/components/layout/` - Layout Components
Shared layout elements used across pages:
- `desktop-sidebar.tsx` - Desktop navigation sidebar with menu items
- `desktop-header.tsx` - Desktop top header with search and user menu
- `mobile-header.tsx` - Mobile top header with hamburger menu
- `bottom-nav.tsx` - Mobile bottom navigation bar
- `page-header.tsx` - Reusable page title/breadcrumb header
- `page-wrapper.tsx` - Consistent page wrapper with padding

#### `/components/modals/` - Reusable Modals
All modal dialogs for CRUD operations:
- `add-transaction-modal.tsx` - Add transaction (income/expense) with AI categorization
- `transaction-modal.tsx` - View/edit transaction details
- `add-budget-modal.tsx` - Create/edit budget
- `add-loan-modal.tsx` - Create/edit loan
- `add-group-modal.tsx` - Create/edit group
- `add-savings-goal-modal.tsx` - Create/edit savings goal
- `add-subscription-modal.tsx` - Create/edit subscription
- `edit-profile-modal.tsx` - Edit user profile
- `change-password-modal.tsx` - Change password
- `delete-account-modal.tsx` - Account deletion confirmation
- `confirmation-modal.tsx` - Generic confirmation dialog

#### `/components/shared/` - Shared Utility Components
Reusable components used across multiple features:
- `glass-card.tsx` - Glassmorphism styled card wrapper
- `stat-card.tsx` - Dashboard statistics card with icon
- `empty-state.tsx` - Empty state placeholder with icon
- `loading-skeleton.tsx` - Loading skeleton states
- `virtual-list.tsx` - Infinite scroll/virtual list with pagination (mobile & desktop)
- `mobile-action-menu.tsx` - Mobile 3-dot menu for edit/delete actions
- `category-selector.tsx` - Category selection component with icons

#### `/components/ui/` - Shadcn UI Components
Base UI components from shadcn/ui (DO NOT MODIFY directly, regenerate via CLI):
- `button.tsx` - Button component with variants
- `input.tsx` - Input field component
- `select.tsx` - Select dropdown component
- `dialog.tsx` - Modal dialog primitive
- `sheet.tsx` - Drawer/sheet primitive
- `form.tsx` - React Hook Form integration
- `label.tsx` - Form label component
- `checkbox.tsx` - Checkbox component
- `radio-group.tsx` - Radio button group
- `switch.tsx` - Toggle switch component
- `progress.tsx` - Progress bar component
- `separator.tsx` - Horizontal/vertical separator
- `avatar.tsx` - User avatar component
- `dropdown-menu.tsx` - Dropdown menu component
- `popover.tsx` - Popover component
- `badge.tsx` - Badge/chip component
- `card.tsx` - Card container component
- `tabs.tsx` - Tabs component
- `toast.tsx` - Toast notification component
- `calendar.tsx` - Date picker calendar
- `command.tsx` - Command palette component
- `scroll-area.tsx` - Custom scrollbar area
- `skeleton.tsx` - Skeleton loading component
- `table.tsx` - Table component
- `textarea.tsx` - Textarea component
- `tooltip.tsx` - Tooltip component

---

### `/lib` - Utilities, Hooks, and Configuration
Core business logic and helpers.

#### `/lib/api/` - API Layer
- `client.ts` - Axios instance with auth interceptors, 401 handling, multi-tab logout
- `endpoints.ts` - API endpoint constants (BASE URLs for all resources)

#### `/lib/categorization/` - AI Categorization System
- `keyword-dictionary.ts` - Comprehensive keyword mappings for expense categories
- `keyword-matcher.ts` - Fuzzy matching algorithm for categorization
- `category-icons.tsx` - Category icon mappings and components
- `category-utils.ts` - Category helper functions

#### `/lib/hooks/` - React Query Hooks
Custom hooks for data fetching (ALWAYS USE THESE, don't create new API calls):
- `use-expenses.ts` - Expense CRUD & pagination
- `use-income.ts` - Income CRUD & pagination
- `use-budget.ts` - Budget operations
- `use-loans.ts` - Loan operations
- `use-groups.ts` - Group operations
- `use-savings.ts` - Savings goal operations
- `use-subscriptions.ts` - Subscription operations
- `use-accounts.ts` - Account operations
- `use-payment-methods.ts` - Payment method operations
- `use-categories.ts` - Category fetching
- `use-tags.ts` - Tag operations
- `use-analytics.ts` - Analytics data
- `use-notifications.ts` - Notifications
- `use-profile.ts` - User profile operations
- `use-settings.ts` - User settings

#### `/lib/stores/` - State Management
- `auth-store.ts` - Authentication state (removed - using localStorage)

#### `/lib/utils/` - Utility Functions
Pure helper functions (REUSE these, don't duplicate):
- `cn.ts` - Class name merger (tailwind-merge + clsx)
- `currency.ts` - Currency formatting utilities
- `format.ts` - Date/number formatting functions
- `transaction-helpers.ts` - Transaction-specific helper functions

#### `/lib/validations/` - Zod Schemas
Form validation schemas (ALWAYS USE for forms):
- `schemas.ts` - Main validation schemas (budget, loan, transaction, group, account, payment method)
- `auth.ts` - Auth schemas (login, signup, forgot password)
- `profile.schema.ts` - Profile update schemas
- `savings.schema.ts` - Savings goal schemas
- `subscription.schema.ts` - Subscription schemas

#### `/lib/config/`
- `query-client.ts` - React Query configuration (stale time, cache time, retry logic)

#### `/lib/`
- `routes.ts` - Route constants and navigation helpers
- `utils.ts` - General utility functions

---

### `/types` - TypeScript Type Definitions
Centralized type definitions (ALWAYS IMPORT from here):
- `index.ts` - Re-exports all types for easy importing
- `expense.ts` - Expense & transaction types
- `income.ts` - Income types
- `budget.ts` - Budget types
- `loan.ts` - Loan types
- `group.ts` - Group & split types
- `split.ts` - Split expense types
- `savings-goal.ts` - Savings goal types
- `subscription.ts` - Subscription types
- `account.ts` - Account types
- `payment-method.ts` - Payment method types
- `category.ts` - Category types
- `tag.ts` - Tag types
- `user.ts` - User & profile types
- `analytics.ts` - Analytics types
- `notification.ts` - Notification types
- `auth.ts` - Auth types (JWT payload, login response)
- `api.ts` - API response types (paginated responses, error responses)
- `next-auth.d.ts` - NextAuth type extensions

---

### `/contexts` - React Context Providers
Global state management (currently minimal, using React Query for most state):
- Auth context (if needed)
- Theme context (if needed)
- User preferences context (if needed)

---

### `/public` - Static Assets
Images, icons, fonts (accessible via `/filename.ext` in code)
- Logos, favicons, images
- Font files (if any)

---

## 🎨 Styling Files

- **`/app/globals.css`** - Global styles, CSS variables, Tailwind directives, theme colors
- **`/tailwind.config.ts`** - Tailwind CSS configuration (colors, fonts, plugins)
- **`/postcss.config.js`** - PostCSS configuration

---

## 📝 Configuration Files

- **`next.config.ts`** - Next.js configuration (images, env, etc.)
- **`tsconfig.json`** - TypeScript configuration
- **`components.json`** - Shadcn UI configuration
- **`.env.local`** - Environment variables (NEVER commit)
- **`package.json`** - Dependencies and scripts
- **`.eslintrc.json`** - ESLint configuration
- **`.prettierrc`** - Prettier configuration (if exists)

---

## 🔧 Backend Structure (`../expense-tracker-server`)

### `/src` - NestJS Source Code
- **`/src/auth/`** - Authentication module (JWT, guards, strategies)
  - `jwt-auth.guard.ts` - JWT authentication guard with enhanced error messages
  - `jwt.strategy.ts` - JWT passport strategy
  - `auth.controller.ts` - Login, register, profile endpoints
  - `auth.service.ts` - Authentication business logic
- **`/src/users/`** - User management
  - `users.controller.ts` - User CRUD endpoints (protected)
  - `users.service.ts` - User business logic
- **`/src/expenses/`** - Expense endpoints
- **`/src/income/`** - Income endpoints
- **`/src/categories/`** - Category endpoints
- **`/src/income-categories/`** - Income category endpoints
- **`/src/budgets/`** - Budget endpoints
- **`/src/loans/`** - Loan endpoints
- **`/src/groups/`** - Group & split endpoints
- **`/src/savings-goals/`** - Savings goal endpoints
- **`/src/subscriptions/`** - Subscription endpoints
- **`/src/accounts/`** - Account endpoints
- **`/src/payment-methods/`** - Payment method endpoints
- **`/src/notifications/`** - Notification endpoints
- **`/src/analytics/`** - Analytics endpoints
- **`/src/categorization/`** - AI categorization endpoints
  - `categorization.controller.ts` - Categorization endpoints (protected)
  - `categorization.service.ts` - Categorization logic
- **`/src/tags/`** - Tag endpoints
- **`/src/splits/`** - Split expense endpoints
- **`/src/summaries/`** - Summary endpoints
- **`/src/invites/`** - Group invite endpoints
- **`/src/user-settings/`** - User settings endpoints
- **`/src/prisma/`** - Prisma service module
- **`/src/common/`** - Common utilities, DTOs, decorators

### `/prisma` - Database
- **`schema.prisma`** - Database schema (Prisma ORM)
  - User, Expense, Income, Budget, Loan, Group, SavingsGoal, Subscription, etc.
- **`/migrations/`** - Database migration history
- **`seed.ts`** - Database seeding script

---

## 🚨 Important Rules for AI

### 1. **ALWAYS Reuse Existing Code**
- Check `/lib/hooks/` before creating new API calls
- Check `/lib/utils/` before creating new helper functions
- Check `/types/` before defining new types
- Check `/components/shared/` before creating new reusable components
- Check `/lib/categorization/` for category-related logic

### 2. **Component Hierarchy**
- Use `/components/ui/` for base primitives (shadcn)
- Use `/components/shared/` for reusable business components
- Use `/components/features/` for page-specific complex components
- Use `/components/modals/` for all modal dialogs
- Use `/components/layout/` for navigation/layout

### 3. **Data Fetching**
- **ALWAYS** use existing hooks from `/lib/hooks/`
- **NEVER** call API directly from components
- Use React Query for all server state
- Use `apiClient` from `/lib/api/client.ts` for all API calls

### 4. **Form Validation**
- **ALWAYS** use Zod schemas from `/lib/validations/`
- **NEVER** create inline validation
- Use React Hook Form with Zod resolver

### 5. **Styling**
- Use Tailwind utility classes
- Use theme CSS variables from `globals.css`
- For reusable styles, use `/components/shared/` components like `glass-card.tsx`
- Follow responsive design patterns (mobile-first)

### 6. **Type Safety**
- Import types from `/types/`
- Never use `any` type
- Use proper TypeScript generics
- Ensure all API responses are typed

### 7. **Database Changes**
- Modify `prisma/schema.prisma` in backend
- Run `npx prisma generate` and `npx prisma migrate dev --name <migration_name>`
- Update corresponding types in frontend `/types/`
- Update DTOs in backend

### 8. **Categorization System**
- Use `/lib/categorization/keyword-dictionary.ts` for keyword mappings
- Use `/lib/categorization/keyword-matcher.ts` for matching logic
- Use `/lib/categorization/category-icons.tsx` for icon mappings
- Backend categorization endpoints are in `/src/categorization/`

### 9. **Mobile Responsiveness**
- Use `mobile-action-menu.tsx` for edit/delete actions on mobile
- Use `virtual-list.tsx` for paginated lists (supports both mobile infinite scroll and desktop pagination)
- Test on mobile breakpoints (sm, md, lg, xl)

---

## 🔄 Common Workflows

### Adding a New Feature Page
1. Create page in `/app/dashboard/[feature]/page.tsx`
2. Create types in `/types/[feature].ts`
3. Create hook in `/lib/hooks/use-[feature].ts`
4. Create modals in `/components/modals/add-[feature]-modal.tsx`
5. Create backend module in `../expense-tracker-server/src/[feature]/`
6. Update Prisma schema if needed
7. Add validation schemas in `/lib/validations/`

### Adding a New Reusable Component
1. Determine type: UI (`/ui/`), shared (`/shared/`), or feature (`/features/`)
2. Check if similar component exists
3. Create with proper TypeScript types
4. Export and document props
5. Update this FILE_STRUCTURE.md

### Modifying Forms
1. Update Zod schema in `/lib/validations/`
2. Update types in `/types/`
3. Update modal component
4. Update hook mutation
5. Update backend DTO

### Adding New Category Keywords
1. Update `/lib/categorization/keyword-dictionary.ts`
2. Add keywords to appropriate category array
3. Test categorization with new keywords
4. Update backend if needed

---

## 📦 Key Dependencies

### Frontend
- **Next.js 14+** - React framework (App Router)
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **Radix UI** - Headless UI primitives
- **NextAuth.js** - Authentication (if used)
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport** - Authentication middleware
- **Class Validator** - DTO validation
- **Class Transformer** - DTO transformation
- **Swagger** - API documentation

---

## 📌 Quick Reference

| Task | Location | Key Files |
|------|----------|-----------|
| Add API endpoint | Backend `/src/[module]/` | `controller.ts`, `service.ts`, `dto.ts` |
| Fetch data | `/lib/hooks/` | `use-[feature].ts` |
| Add modal | `/components/modals/` | `add-[feature]-modal.tsx` |
| Validate form | `/lib/validations/` | `schemas.ts` or `[feature].schema.ts` |
| Format data | `/lib/utils/` | `format.ts`, `currency.ts` |
| Define types | `/types/` | `[feature].ts` |
| Create page | `/app/dashboard/[feature]/` | `page.tsx` |
| Add shared component | `/components/shared/` | `[component-name].tsx` |
| Update styles | `/app/globals.css` | Global CSS variables |
| Add category keywords | `/lib/categorization/` | `keyword-dictionary.ts` |
| Mobile actions | `/components/shared/` | `mobile-action-menu.tsx` |
| Pagination | `/components/shared/` | `virtual-list.tsx` |

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Protected Routes** - All dashboard routes require authentication
- **401 Handling** - Automatic logout on token expiration
- **Multi-tab Sync** - Logout syncs across all browser tabs
- **Password Hashing** - Bcrypt password hashing
- **CORS Protection** - Configured CORS policies
- **Input Validation** - Zod schemas + Class Validator
- **SQL Injection Prevention** - Prisma ORM parameterized queries

---

**Last Updated**: December 2025  
**Maintainer**: EXPENZY Team

**Note**: This file should be updated whenever new files, directories, or significant features are added to the project.
