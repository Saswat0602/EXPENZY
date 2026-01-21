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
// import { LoansModule } from './loans/loans.module';
import { SplitsModule } from './splits/splits.module';
// import { GroupsModule } from './groups/groups.module';
// import { InvitesModule } from './invites/invites.module';
import { IncomeModule } from './income/income.module';
import { SavingsModule } from './savings/savings.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
// import { AnalyticsModule } from './analytics/analytics.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/env.validation';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AvatarModule } from './avatar/avatar.module';
// import { ExportModule } from './export/export.module';
import { CommonModule } from './common/common.module';

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
    CommonModule,
    AuthModule,
    UsersModule,
    ExpensesModule,
    CategoriesModule,
    // LoansModule,
    // SplitsModule,
    // GroupsModule,
    // InvitesModule,
    IncomeModule,
    SavingsModule,
    UserSettingsModule,
    // AnalyticsModule,
    SchedulerModule,
    AvatarModule,
    // ExportModule,
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
export class AppModule { }
