import { Injectable } from '@nestjs/common';
import { KEYWORDS } from './keyword-dictionary';

@Injectable()
export class KeywordService {
  /**
   * Detect category based on keyword matching
   * @param text - Normalized text to search
   * @returns Category name or null if no match
   */
  detect(text: string): string | null {
    const normalizedText = text.toLowerCase().trim();

    for (const [category, keywords] of Object.entries(KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    return null;
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Object.keys(KEYWORDS);
  }

  /**
   * Get keywords for a specific category
   */
  getKeywordsForCategory(category: string): string[] {
    if (category in KEYWORDS) {
      return KEYWORDS[category];
    }
    return [];
  }
}
