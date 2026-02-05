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

      this.logger.log(`Attempting to send email to ${options.to} from ${emailFrom} with subject "${options.subject}"`);
      this.logger.debug(`Transporter config: Host=${this.transporter.options['host']}, Port=${this.transporter.options['port']}, User=${this.transporter.options['auth']?.user}`);

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent successfully to ${options.to}. MessageID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      console.error('Email Send Error Details:', JSON.stringify(error, null, 2));
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

  async sendOtpEmail(
    to: string,
    code: string,
    purpose: 'registration' | 'login' | 'password_reset',
  ): Promise<boolean> {
    const purposeText = {
      registration: 'Email Verification',
      login: 'Login Verification',
      password_reset: 'Password Reset',
    }[purpose];

    const messageText = {
      registration:
        'Thank you for signing up with EXPENZY! Please use the code below to verify your email address and activate your account.',
      login: 'Please use the code below to complete your login.',
      password_reset:
        'You requested to reset your password. Please use the code below to proceed with password reset.',
    }[purpose];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px dashed #667eea; }
          .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .expiry { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 ${purposeText}</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p>${messageText}</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <div class="otp-code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">This code will expire in <span class="expiry">10 minutes</span></p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>EXPENZY will never ask for this code via phone or email</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>

            <p style="margin-top: 20px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from EXPENZY</p>
            <p>© ${new Date().getFullYear()} EXPENZY. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
${purposeText}

${messageText}

Your verification code is: ${code}

This code will expire in 10 minutes.

SECURITY NOTICE:
- Never share this code with anyone
- EXPENZY will never ask for this code via phone or email
- If you didn't request this code, please ignore this email

© ${new Date().getFullYear()} EXPENZY. All rights reserved.
    `;

    return this.sendEmail({
      to,
      subject: `${purposeText} - Your OTP Code`,
      text: text.trim(),
      html,
    });
  }
}
