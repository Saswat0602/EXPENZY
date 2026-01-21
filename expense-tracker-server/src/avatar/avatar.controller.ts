import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AvatarService } from './avatar.service';

@Controller('avatars')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  /**
   * Get avatar SVG by seed
   * @param seed - Unique seed for avatar generation
   * @returns SVG image
   */
  @Get(':seed')
  getAvatar(@Param('seed') seed: string, @Res() res: Response): void {
    try {
      // Remove .svg extension if present
      const cleanSeed = seed.replace(/\.svg$/, '');

      // Generate SVG
      const svg = this.avatarService.generateSvg(cleanSeed);

      // Send raw SVG response
      res
        .set('Content-Type', 'image/svg+xml')
        .set('Cache-Control', 'public, max-age=31536000, immutable')
        .set('Access-Control-Allow-Origin', '*')
        .send(svg);
    } catch {
      throw new HttpException(
        'Failed to generate avatar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get avatar SVG by style and seed
   * @param style - Avatar style
   * @param seed - Unique seed for avatar generation
   * @returns SVG image
   */
  @Get(':style/:seed')
  getAvatarWithStyle(
    @Param('style') style: string,
    @Param('seed') seed: string,
    @Res() res: Response,
  ): void {
    try {
      // Remove .svg extension if present
      const cleanSeed = seed.replace(/\.svg$/, '');

      // Generate SVG
      const svg = this.avatarService.generateSvg(cleanSeed, style);

      // Send raw SVG response
      res
        .set('Content-Type', 'image/svg+xml')
        .set('Cache-Control', 'public, max-age=31536000, immutable')
        .set('Access-Control-Allow-Origin', '*')
        .send(svg);
    } catch {
      throw new HttpException(
        'Failed to generate avatar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
