import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './categories/categories.module';
import { LoansModule } from './loans/loans.module';
import { SplitsModule } from './splits/splits.module';
import { SummariesModule } from './summaries/summaries.module';
import { GroupsModule } from './groups/groups.module';
import { InvitesModule } from './invites/invites.module';
import { IncomeModule } from './income/income.module';
import { SavingsModule } from './savings/savings.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { AccountsModule } from './accounts/accounts.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/env.validation';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Rate Limiting - 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ExpensesModule,
    CategoriesModule,
    LoansModule,
    SplitsModule,
    SummariesModule,
    GroupsModule,
    InvitesModule,
    IncomeModule,
    SavingsModule,
    SubscriptionsModule,
    PaymentMethodsModule,
    AccountsModule,
    UserSettingsModule,
    AnalyticsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
