import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly emailEnabled: boolean;

  constructor(private configService: ConfigService) {
    // Check for SMTP_ variables (standard) or EMAIL_ variables (legacy/fallback)
    const emailHost =
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('EMAIL_HOST');
    const emailPort =
      this.configService.get<number>('SMTP_PORT') ||
      this.configService.get<number>('EMAIL_PORT');
    const emailUser =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('EMAIL_USER');
    const emailPass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('EMAIL_PASS');

    this.emailEnabled = !!(emailHost && emailPort && emailUser && emailPass);

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.logger.log('Email service initialized successfully');
    } else {
      const missing: string[] = [];
      if (!emailHost) missing.push('SMTP_HOST/EMAIL_HOST');
      if (!emailPort) missing.push('SMTP_PORT/EMAIL_PORT');
      if (!emailUser) missing.push('SMTP_USER/EMAIL_USER');
      if (!emailPass) missing.push('SMTP_PASS/EMAIL_PASS');

      this.logger.warn(
        `Email service not configured. Missing variables: ${missing.join(', ')} - emails will be logged only`,
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailEnabled || !this.transporter) {
      this.logger.log(
        `[EMAIL NOT SENT - Service disabled] To: ${options.to}, Subject: ${options.subject}`,
      );
      return false;
    }

    try {
      const emailFrom =
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('EMAIL_FROM') ||
        'noreply@expenzy.com';

      await this.transporter.sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendReminderEmail(
    to: string,
    title: string,
    message: string,
    actionUrl?: string,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 EXPENZY Reminder</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated reminder from EXPENZY</p>
            <p>If you didn't request this, please ignore this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Reminder: ${title}`,
      text: `${title}\n\n${message}${actionUrl ? `\n\nView details: ${actionUrl}` : ''}`,
      html,
    });
  }
}
