import { Injectable, Logger } from '@nestjs/common';
import { MLService } from './ml.service';
import { CacheService } from './cache.service';
import { KeywordDbService } from './keyword-db.service';
import { CategorizationResultDto } from './dto/categorization-result.dto';

@Injectable()
export class CategorizationService {
  private readonly logger = new Logger(CategorizationService.name);

  constructor(
    private readonly mlService: MLService,
    private readonly cacheService: CacheService,
    private readonly keywordDbService: KeywordDbService,
  ) {}

  /**
   * Main categorization method - simplified 2-tier approach
   * Frontend handles keyword matching, backend only does ML
   *
   * Flow: Cache Check → ML Model → Default to 'other'
   */
  async categorize(description: string): Promise<CategorizationResultDto> {
    const normalized = description.toLowerCase().trim();

    this.logger.debug(`Categorizing: "${description}"`);

    // Step 1: Check cache
    const cached = await this.cacheService.get(normalized);
    if (cached) {
      this.logger.debug(`Cache hit for: "${description}"`);
      return cached;
    }

    // Step 2: ML model (HuggingFace only)
    if (this.mlService.isAvailable()) {
      const mlResult = await this.mlService.predict(normalized);

      // Lower threshold since we removed LLM fallback
      if (mlResult.confidence >= 0.5) {
        const result: CategorizationResultDto = {
          category: mlResult.category,
          confidence: mlResult.confidence,
          source: 'ml',
        };

        this.logger.debug(
          `ML prediction: ${mlResult.category} (${mlResult.confidence})`,
        );
        await this.cacheService.save(normalized, result);
        return result;
      }

      this.logger.debug(
        `ML confidence too low: ${mlResult.confidence}, defaulting to 'other'`,
      );
    } else {
      this.logger.warn('ML service not available');
    }

    // Step 3: Default to 'other' if ML fails or low confidence
    const fallbackResult: CategorizationResultDto = {
      category: 'other',
      confidence: 0.5,
      source: 'ml',
    };

    await this.cacheService.save(normalized, fallbackResult);
    return fallbackResult;
  }

  /**
   * Batch categorization
   */
  async categorizeBatch(
    descriptions: string[],
  ): Promise<CategorizationResultDto[]> {
    return Promise.all(descriptions.map((desc) => this.categorize(desc)));
  }

  /**
   * Get all keywords for frontend (system + user custom)
   */
  async getKeywords(userId?: string): Promise<Record<string, string[]>> {
    const systemKeywords = await this.keywordDbService.getAllKeywords();

    if (!userId) {
      return systemKeywords;
    }

    const userKeywords = await this.keywordDbService.getUserKeywords(userId);

    // Merge system and user keywords
    const merged = { ...systemKeywords };
    for (const [category, keywords] of Object.entries(userKeywords)) {
      if (!merged[category]) {
        merged[category] = [];
      }
      merged[category] = [...merged[category], ...keywords];
    }

    return merged;
  }

  /**
   * Add custom keyword
   */
  async addCustomKeyword(userId: string, category: string, keyword: string) {
    return this.keywordDbService.addKeyword(userId, category, keyword);
  }

  /**
   * Remove custom keyword
   */
  async removeCustomKeyword(userId: string, keywordId: string) {
    return this.keywordDbService.removeKeyword(userId, keywordId);
  }

  /**
   * Get available categories
   */
  getCategories(): string[] {
    return this.keywordDbService.getCategories();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cacheService.getStats();
  }

  /**
   * Clear cache
   */
  async clearCache() {
    await this.cacheService.clearAll();
  }
}
