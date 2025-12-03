import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategorizationService } from './categorization.service';
import { CategorizeDto } from './dto/categorize.dto';
import { CategorizationResultDto } from './dto/categorization-result.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categorization')
export class CategorizationController {
  constructor(private readonly categorizationService: CategorizationService) {}

  /**
   * Categorize a single expense description
   */
  @Post('detect')
  async categorize(
    @Body() dto: CategorizeDto,
  ): Promise<CategorizationResultDto> {
    return this.categorizationService.categorize(dto.description);
  }

  /**
   * Categorize multiple descriptions
   */
  @Post('batch')
  async categorizeBatch(
    @Body() dto: { descriptions: string[] },
  ): Promise<CategorizationResultDto[]> {
    return this.categorizationService.categorizeBatch(dto.descriptions);
  }

  /**
   * Get all keywords for frontend (system + user custom)
   */
  @Get('keywords')
  @UseGuards(JwtAuthGuard)
  async getKeywords(
    @Request() req: { user: { userId: string } },
  ): Promise<Record<string, string[]>> {
    return this.categorizationService.getKeywords(req.user.userId);
  }

  /**
   * Get system keywords only (public endpoint for initial load)
   */
  @Get('keywords/system')
  async getSystemKeywords(): Promise<Record<string, string[]>> {
    return this.categorizationService.getKeywords();
  }

  /**
   * Add custom keyword
   */
  @Post('keywords')
  @UseGuards(JwtAuthGuard)
  async addKeyword(
    @Request() req: { user: { userId: string } },
    @Body() dto: { category: string; keyword: string },
  ) {
    return this.categorizationService.addCustomKeyword(
      req.user.userId,
      dto.category,
      dto.keyword,
    );
  }

  /**
   * Remove custom keyword
   */
  @Delete('keywords/:keywordId')
  @UseGuards(JwtAuthGuard)
  async removeKeyword(
    @Request() req: { user: { userId: string } },
    @Param('keywordId') keywordId: string,
  ) {
    await this.categorizationService.removeCustomKeyword(
      req.user.userId,
      keywordId,
    );
    return { message: 'Keyword removed successfully' };
  }

  /**
   * Get all available categories
   */
  @Get('categories')
  getCategories(): string[] {
    return this.categorizationService.getCategories();
  }

  /**
   * Get cache statistics
   */
  @Get('cache/stats')
  async getCacheStats() {
    return this.categorizationService.getCacheStats();
  }

  /**
   * Clear cache
   */
  @Delete('cache')
  async clearCache() {
    await this.categorizationService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}
