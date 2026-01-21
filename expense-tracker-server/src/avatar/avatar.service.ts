import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/core';
import * as funEmoji from '@dicebear/fun-emoji';
import * as adventurer from '@dicebear/adventurer';
import * as adventurerNeutral from '@dicebear/adventurer-neutral';
import * as thumbs from '@dicebear/thumbs';

type AvatarStyle = 'fun-emoji' | 'adventurer' | 'adventurer-neutral' | 'thumbs';

@Injectable()
export class AvatarService {
  /**
   * Get DiceBear style collection by name
   */
  private getStyleCollection(style: string): any {
    const styleMap: Record<string, any> = {
      'fun-emoji': funEmoji,
      adventurer: adventurer,
      'adventurer-neutral': adventurerNeutral,
      thumbs: thumbs,
    };

    return styleMap[style as AvatarStyle] || funEmoji;
  }

  /**
   * Generate SVG avatar from seed
   * @param seed - Unique identifier for deterministic avatar generation
   * @param style - Avatar style (fun-emoji, adventurer, adventurer-neutral, thumbs)
   * @returns SVG string
   */
  generateSvg(seed: string, style: string = 'fun-emoji'): string {
    // Validate and sanitize seed
    const safeSeed = this.sanitizeSeed(seed);

    // Get style collection
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const styleCollection = this.getStyleCollection(style);

    // Generate avatar using DiceBear
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const avatar = createAvatar(styleCollection, {
      seed: safeSeed,
    });

    return avatar.toString();
  }

  /**
   * Sanitize seed to prevent injection attacks
   * @param seed - Raw seed input
   * @returns Sanitized seed
   */
  private sanitizeSeed(seed: string): string {
    if (!seed || typeof seed !== 'string') {
      return 'default';
    }

    // Limit length to prevent abuse
    const maxLength = 100;
    const trimmedSeed = seed.trim().substring(0, maxLength);

    // Return sanitized seed or default
    return trimmedSeed || 'default';
  }
}
