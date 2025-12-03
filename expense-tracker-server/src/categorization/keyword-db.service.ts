import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KEYWORDS } from './keyword-dictionary';

@Injectable()
export class KeywordDbService implements OnModuleInit {
  private readonly logger = new Logger(KeywordDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed system keywords on module initialization
   */
  async onModuleInit() {
    await this.seedSystemKeywords();
  }

  /**
   * Get all keywords grouped by category for frontend
   */
  async getAllKeywords(): Promise<Record<string, string[]>> {
    const keywords = await this.prisma.categoryKeyword.findMany({
      where: { isSystem: true },
      orderBy: [{ priority: 'desc' }, { keyword: 'asc' }],
    });

    // Group by category
    return keywords.reduce(
      (acc, kw) => {
        if (!acc[kw.category]) {
          acc[kw.category] = [];
        }
        acc[kw.category].push(kw.keyword);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  /**
   * Get user's custom keywords
   */
  async getUserKeywords(userId: string): Promise<Record<string, string[]>> {
    const keywords = await this.prisma.categoryKeyword.findMany({
      where: { userId, isSystem: false },
      orderBy: [{ priority: 'desc' }, { keyword: 'asc' }],
    });

    return keywords.reduce(
      (acc, kw) => {
        if (!acc[kw.category]) {
          acc[kw.category] = [];
        }
        acc[kw.category].push(kw.keyword);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  /**
   * Add custom keyword for user
   */
  async addKeyword(userId: string, category: string, keyword: string) {
    return this.prisma.categoryKeyword.create({
      data: {
        userId,
        category,
        keyword: keyword.toLowerCase().trim(),
        isSystem: false,
        priority: 1, // User keywords have higher priority
      },
    });
  }

  /**
   * Remove custom keyword
   */
  async removeKeyword(userId: string, keywordId: string) {
    return this.prisma.categoryKeyword.deleteMany({
      where: {
        id: keywordId,
        userId,
        isSystem: false, // Can only delete custom keywords
      },
    });
  }

  /**
   * Seed system keywords from hardcoded dictionary
   */
  private async seedSystemKeywords() {
    try {
      // Check if already seeded
      const count = await this.prisma.categoryKeyword.count({
        where: { isSystem: true },
      });

      if (count > 0) {
        this.logger.log('System keywords already seeded');
        return;
      }

      this.logger.log('Seeding system keywords...');

      const keywordsToInsert: Array<{
        category: string;
        keyword: string;
        isSystem: boolean;
        priority: number;
      }> = [];

      for (const [category, keywords] of Object.entries(KEYWORDS)) {
        for (const keyword of keywords) {
          keywordsToInsert.push({
            category,
            keyword: keyword.toLowerCase().trim(),
            isSystem: true,
            priority: 0,
          });
        }
      }

      await this.prisma.categoryKeyword.createMany({
        data: keywordsToInsert,
        skipDuplicates: true,
      });

      this.logger.log(`Seeded ${keywordsToInsert.length} system keywords`);
    } catch (error) {
      this.logger.error('Error seeding keywords', error);
    }
  }

  /**
   * Get categories list
   */
  getCategories(): string[] {
    return Object.keys(KEYWORDS);
  }
}
