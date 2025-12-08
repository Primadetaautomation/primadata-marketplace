import nodemailer, { Transporter } from 'nodemailer';
import { EmailOptions, EmailResult } from '../../types';
import { logger } from '../../utils/logger';

export class EmailService {
  private transporter: Transporter | null = null;
  private provider: 'postmark' | 'mailgun' | 'smtp' = 'smtp';
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Recruitment Team';
    this.initializeProvider();
  }

  private initializeProvider() {
    // Try Postmark first
    if (process.env.POSTMARK_API_KEY) {
      this.provider = 'postmark';
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.postmarkapp.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.POSTMARK_API_KEY,
          pass: process.env.POSTMARK_API_KEY,
        },
      });
      logger.info('Email service using Postmark');
      return;
    }

    // Try Mailgun
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      this.provider = 'mailgun';
      this.transporter = nodemailer.createTransporter({
        host: process.env.MAILGUN_HOST || 'smtp.eu.mailgun.org',
        port: 587,
        secure: false,
        auth: {
          user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
          pass: process.env.MAILGUN_API_KEY,
        },
      });
      logger.info('Email service using Mailgun');
      return;
    }

    // Fallback to SMTP
    if (process.env.SMTP_HOST) {
      this.provider = 'smtp';
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });
      logger.info('Email service using SMTP');
      return;
    }

    logger.warn('No email provider configured - emails will not be sent');
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.transporter) {
      logger.warn('Email not sent - no provider configured', { to: options.to });
      return {
        success: false,
        error: 'No email provider configured',
        provider: this.provider,
      };
    }

    try {
      const mailOptions = {
        from: options.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || this.generateHtml(options.text),
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        headers: this.getProviderHeaders(options),
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
        provider: this.provider,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.provider,
      };
    } catch (error: any) {
      logger.error('Email send error:', {
        error: error.message,
        to: options.to,
        provider: this.provider,
      });

      return {
        success: false,
        error: error.message,
        provider: this.provider,
      };
    }
  }

  private generateHtml(text: string): string {
    // Convert plain text to simple HTML
    const paragraphs = text.split('\n\n');
    const htmlParagraphs = paragraphs.map(p => {
      const lines = p.split('\n');
      return `<p>${lines.join('<br>')}</p>`;
    });

    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p {
      margin: 0 0 1em 0;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  ${htmlParagraphs.join('\n')}
  <div class="footer">
    <p>Met vriendelijke groet,<br>${this.fromName}</p>
  </div>
</body>
</html>`;
  }

  private getProviderHeaders(options: EmailOptions): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.provider === 'postmark' && options.tags) {
      headers['X-PM-Tag'] = options.tags[0]; // Postmark supports one tag per email
    }

    if (this.provider === 'mailgun' && options.tags) {
      headers['X-Mailgun-Tag'] = options.tags.join(',');
    }

    // Add tracking pixel for open tracking (optional)
    if (options.metadata?.trackOpens) {
      headers['X-Track-Opens'] = 'true';
    }

    // Add custom headers for metadata
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        headers[`X-Custom-${key}`] = String(value);
      });
    }

    return headers;
  }

  async sendBulkEmails(recipients: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    // Send emails in batches with delays
    const batchSize = 10;
    const delayMs = 1000;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(options => this.sendEmail(options));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            provider: this.provider,
          });
        }
      });

      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  async verifyConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service verified successfully');
      return true;
    } catch (error) {
      logger.error('Email service verification failed:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: 'Test Email - Recruitment Outreach Engine',
      text: `Dit is een test e-mail van de Recruitment Outreach Engine.

Als je deze e-mail ontvangt, is de e-mail configuratie correct ingesteld.

Provider: ${this.provider}
Timestamp: ${new Date().toISOString()}

Met vriendelijke groet,
Het Recruitment Team`,
    });
  }

  // Template methods for common email types
  async sendWelcomeEmail(to: string, candidateName: string): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: 'Welkom bij ons recruitment proces',
      text: `Beste ${candidateName},

Bedankt voor je interesse in onze vacatures. We hebben je profiel ontvangen en zullen dit binnenkort beoordelen.

Je hoort spoedig van ons.

Met vriendelijke groet,
${this.fromName}`,
    });
  }

  async sendReplyNotification(
    to: string,
    candidateName: string,
    replyContent: string
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: process.env.NOTIFICATION_EMAIL || this.fromEmail,
      subject: `Nieuwe reactie van ${candidateName}`,
      text: `Er is een nieuwe reactie ontvangen van ${candidateName}.

E-mail: ${to}

Reactie:
${replyContent}

Bekijk de volledige conversatie in het dashboard.`,
    });
  }
}

export default new EmailService();