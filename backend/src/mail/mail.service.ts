import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;

  async sendInvoice(to: string, subject: string, text: string) {
    if (!this.transporter) {
      // No SMTP configured; skip sending
      return { sent: false };
    }
    const info = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@xmtd.local',
      to,
      subject,
      text,
    });
    return { sent: true, messageId: info.messageId };
  }
}
