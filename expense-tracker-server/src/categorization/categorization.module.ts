import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategorizationService } from './categorization.service';
import { CategorizationController } from './categorization.controller';
import { KeywordService } from './keyword.service';
import { KeywordDbService } from './keyword-db.service';
import { MLService } from './ml.service';
import { CacheService } from './cache.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [CategorizationController],
  providers: [
    CategorizationService,
    KeywordService,
    KeywordDbService,
    MLService,
    CacheService,
  ],
  exports: [CategorizationService, KeywordDbService],
})
export class CategorizationModule {}
