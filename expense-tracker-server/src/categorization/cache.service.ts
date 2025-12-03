import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CacheService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get cached categorization result
   */
  async get(description: string) {
    const normalized = description.toLowerCase().trim();

    const cached = await this.prisma.categoryCache.findUnique({
      where: { description: normalized },
    });

    if (cached) {
      return {
        category: cached.category,
        confidence: cached.confidence,
        source: 'cache' as const,
      };
    }

    return null;
  }

  /**
   * Save categorization result to cache
   */
  async save(
    description: string,
    result: { category: string; confidence: number; source: string },
  ) {
    const normalized = description.toLowerCase().trim();

    await this.prisma.categoryCache.upsert({
      where: { description: normalized },
      update: {
        category: result.category,
        confidence: result.confidence,
        source: result.source,
      },
      create: {
        description: normalized,
        category: result.category,
        confidence: result.confidence,
        source: result.source,
      },
    });
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    await this.prisma.categoryCache.deleteMany();
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const total = await this.prisma.categoryCache.count();
    const bySource = await this.prisma.categoryCache.groupBy({
      by: ['source'],
      _count: true,
    });

    return {
      total,
      bySource,
    };
  }
}
