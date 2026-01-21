import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRATION_MINUTES = 10;
  private readonly MAX_OTP_PER_DAY = 5;

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate and store OTP for a user
   */
  async generateOtp(
    email: string,
    purpose: 'registration' | 'login' | 'password_reset',
    userId?: string,
  ): Promise<string> {
    // Check rate limiting - max 5 OTPs per day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentOtps = await this.prisma.otp.count({
      where: {
        email,
        purpose,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (recentOtps >= this.MAX_OTP_PER_DAY) {
      throw new BadRequestException(
        'Maximum OTP requests exceeded. Please try again tomorrow.',
      );
    }

    // Invalidate any existing unused OTPs for this email and purpose
    await this.prisma.otp.updateMany({
      where: {
        email,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Generate new OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES);

    await this.prisma.otp.create({
      data: {
        email,
        code,
        purpose,
        expiresAt,
        userId,
      },
    });

    this.logger.log(
      `OTP generated for ${email} (purpose: ${purpose}): ${code}`,
    );

    return code;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(
    email: string,
    code: string,
    purpose: 'registration' | 'login' | 'password_reset',
  ): Promise<boolean> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        purpose,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP code has expired');
    }

    // Check if max attempts exceeded
    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Increment attempts
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: {
        attempts: otp.attempts + 1,
      },
    });

    // Mark as used
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    this.logger.log(`OTP verified successfully for ${email}`);
    return true;
  }

  /**
   * Resend OTP (generates new OTP)
   */
  async resendOtp(
    email: string,
    purpose: 'registration' | 'login' | 'password_reset',
    userId?: string,
  ): Promise<string> {
    return this.generateOtp(email, purpose, userId);
  }

  /**
   * Clean up expired OTPs (runs daily at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredOtps() {
    const result = await this.prisma.otp.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            isUsed: true,
            usedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired/used OTP records`);
  }

  /**
   * Get OTP for testing purposes (only in development)
   */
  async getOtpForTesting(
    email: string,
    purpose: string,
  ): Promise<string | null> {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        purpose,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return otp?.code || null;
  }
}
