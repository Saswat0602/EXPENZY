# 💰 EXPENZY - Personal Finance Management System

A modern, full-stack expense tracking and financial management application built with Next.js 14, NestJS, and PostgreSQL.

![EXPENZY](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10+-red?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

## ✨ Features

### Core Features
- 💳 **Expense & Income Tracking** - Track all your financial transactions
- 📊 **Analytics & Insights** - Visual dashboards with spending patterns
- 🎯 **Budget Management** - Set and monitor budgets by category
- 💰 **Savings Goals** - Create and track savings goals
- 🔄 **Recurring Subscriptions** - Manage recurring payments
- 👥 **Group Expenses** - Split expenses with friends/family
- 💸 **Loan Tracking** - Track money lent and borrowed
- 🏦 **Multi-Account Support** - Manage multiple bank accounts
- 💳 **Payment Methods** - Track different payment methods
- 🏷️ **Tags & Categories** - Organize transactions with custom tags
- 🔔 **Notifications** - Stay updated with financial alerts
- 🤖 **AI-Powered Categorization** - Automatic expense categorization

### Technical Features
- 🔐 **JWT Authentication** - Secure user authentication
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Eye-friendly dark theme
- ♿ **Accessibility** - WCAG compliant
- 🚀 **Optimized Performance** - Fast page loads and smooth interactions
- 🔄 **Real-time Updates** - React Query for efficient data fetching
- 📄 **Pagination** - Efficient data loading with virtual lists
- 🎨 **Modern UI** - Beautiful glassmorphism design

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [React Query (TanStack Query)](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Validation**: [Class Validator](https://github.com/typestack/class-validator)
- **API Documentation**: [Swagger/OpenAPI](https://swagger.io/)

## 📁 Project Structure

```
EXPENZY/
├── expenzy/                    # Frontend (Next.js)
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/auth/          # NextAuth API routes
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── components/            # React components
│   │   ├── features/          # Feature-specific components
│   │   ├── layout/            # Layout components (sidebar, header, etc.)
│   │   ├── modals/            # Modal dialogs
│   │   ├── shared/            # Reusable components
│   │   └── ui/                # Shadcn UI components
│   ├── lib/                   # Utilities and configuration
│   │   ├── api/               # API client and endpoints
│   │   ├── categorization/    # AI categorization logic
│   │   ├── hooks/             # React Query hooks
│   │   ├── stores/            # State stores
│   │   ├── utils/             # Helper functions
│   │   └── validations/       # Zod schemas
│   ├── types/                 # TypeScript type definitions
│   └── public/                # Static assets
│
└── expense-tracker-server/    # Backend (NestJS)
    ├── src/
    │   ├── auth/              # Authentication module
    │   ├── users/             # User management
    │   ├── expenses/          # Expense endpoints
    │   ├── income/            # Income endpoints
    │   ├── categories/        # Category management
    │   ├── budgets/           # Budget endpoints
    │   ├── loans/             # Loan tracking
    │   ├── groups/            # Group expenses
    │   ├── savings-goals/     # Savings goals
    │   ├── subscriptions/     # Recurring subscriptions
    │   ├── accounts/          # Account management
    │   ├── payment-methods/   # Payment methods
    │   ├── analytics/         # Analytics endpoints
    │   ├── notifications/     # Notification system
    │   └── categorization/    # AI categorization
    └── prisma/
        ├── schema.prisma      # Database schema
        └── migrations/        # Database migrations
```

See [FILE_STRUCTURE.md](./expenzy/FILE_STRUCTURE.md) for detailed file structure.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **PostgreSQL** (v15.0 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EXPENZY.git
cd EXPENZY
```

### 2. Install Frontend Dependencies

```bash
cd expenzy
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../expense-tracker-server
npm install
```

## 🔐 Environment Variables

### Frontend (.env.local)

Create a `.env.local` file in the `expenzy` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Backend (.env)

Create a `.env` file in the `expense-tracker-server` directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/expenzy_db?schema=public"

# JWT Configuration
JWT_SECRET=your-jwt-secret-here-generate-with-openssl
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Google OAuth (Optional - must match frontend)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 64
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expenzy_db;

# Exit psql
\q
```

### 2. Run Prisma Migrations

```bash
cd expense-tracker-server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 3. View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

This will open a browser at `http://localhost:5555` with a GUI for your database.

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd expense-tracker-server
npm run start:dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd expenzy
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd expense-tracker-server
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd expenzy
npm run build
npm start
```

## 📚 API Documentation

Once the backend is running, you can access the Swagger API documentation at:

```
http://localhost:5000/api/docs
```

### Key Endpoints

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Expenses**: `/api/expenses`
- **Income**: `/api/income`
- **Budgets**: `/api/budgets`
- **Analytics**: `/api/analytics`
- **Categories**: `/api/categories`
- **Loans**: `/api/loans`
- **Groups**: `/api/groups`
- **Savings**: `/api/savings-goals`
- **Subscriptions**: `/api/subscriptions`

## 🧪 Testing

### Backend Tests
```bash
cd expense-tracker-server
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd expenzy
npm run test
```

## 🔧 Common Issues & Solutions

### Issue: Database connection failed
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct
```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Issue: Port already in use
**Solution**: Kill the process using the port
```bash
# Find process on port 3000 or 5000
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Issue: Prisma client not generated
**Solution**: Regenerate Prisma client
```bash
cd expense-tracker-server
npx prisma generate
```

## 📱 Features Walkthrough

### 1. User Registration & Login
- Sign up with email/password or Google OAuth
- Secure JWT-based authentication
- Password reset functionality

### 2. Dashboard
- Overview of financial health
- Quick stats (total expenses, income, balance)
- Recent transactions
- Spending by category charts

### 3. Transactions
- Add/edit/delete expenses and income
- AI-powered automatic categorization
- Search and filter transactions
- Pagination for large datasets

### 4. Budgets
- Set monthly budgets by category
- Track spending vs budget
- Visual progress indicators
- Alerts when approaching limits

### 5. Analytics
- Spending trends over time
- Category-wise breakdown
- Income vs expense comparison
- Custom date range analysis

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **EXPENZY Team** - *Initial work*

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [NestJS](https://nestjs.com/) for the robust backend framework
- [Shadcn UI](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://www.prisma.io/) for the excellent ORM

## 📞 Support

For support, email support@expenzy.com or open an issue in the repository.

---

**Made with ❤️ by the EXPENZY Team**
