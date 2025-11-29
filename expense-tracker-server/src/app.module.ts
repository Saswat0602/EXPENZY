import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { LoansModule } from './loans/loans.module';
import { SplitsModule } from './splits/splits.module';
import { SummariesModule } from './summaries/summaries.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { InvitesModule } from './invites/invites.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PrismaModule,
    UsersModule,
    CategoriesModule,
    ExpensesModule,
    LoansModule,
    SplitsModule,
    SummariesModule,
    AuthModule,
    GroupsModule,
    InvitesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

