import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
// import { LoansModule } from '../loans/loans.module';
import { SplitsModule } from '../splits/splits.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [SplitsModule, GroupsModule],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule { }
