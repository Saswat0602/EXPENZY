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
    const emailHost = this.configService.get<string>('EMAIL_HOST');
    const emailPort = this.configService.get<number>('EMAIL_PORT');
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    this.emailEnabled = !!(emailHost && emailPort && emailUser && emailPass);

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.logger.log('Email service initialized successfully');
    } else {
      this.logger.warn(
        'Email service not configured - emails will be logged only',
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
        this.configService.get<string>('EMAIL_FROM') || 'noreply@expenzy.com';

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

  async sendGroupInviteEmail(
    to: string,
    groupName: string,
    inviterName: string,
    inviteToken: string,
  ): Promise<boolean> {
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const inviteLink = `${appUrl}/invites/${inviteToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .group-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .info-label { font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited to Join a Group!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p><strong>${inviterName}</strong> has invited you to join their group on EXPENZY.</p>
            
            <div class="group-info">
              <p class="info-label">Group Name:</p>
              <h2 style="margin: 5px 0 15px 0;">${groupName}</h2>
            </div>

            <p>EXPENZY makes it easy to split expenses, track group spending, and settle up with friends.</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>If you already have an account, click the button below to accept the invite</li>
              <li>If you're new to EXPENZY, you'll be prompted to create an account first</li>
            </ul>

            <a href="${inviteLink}" class="button">Accept Invite & Join Group</a>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${inviteLink}">${inviteLink}</a>
            </p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ${inviterName} via EXPENZY</p>
            <p>If you didn't expect this invitation, you can safely ignore this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
You're Invited to Join a Group on EXPENZY!

${inviterName} has invited you to join their group: ${groupName}

EXPENZY makes it easy to split expenses, track group spending, and settle up with friends.

What's next?
- If you already have an account, click the link below to accept the invite
- If you're new to EXPENZY, you'll be prompted to create an account first

Accept Invite: ${inviteLink}

This invitation was sent by ${inviterName} via EXPENZY.
If you didn't expect this invitation, you can safely ignore this email.
    `;

    return this.sendEmail({
      to,
      subject: `You're invited to join "${groupName}" on EXPENZY`,
      text: text.trim(),
      html,
    });
  }
}
