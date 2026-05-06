const nodemailer = require('nodemailer');
const env = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  #hasSmtpConfig() {
    return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFromEmail);
  }

  #getTransporter() {
    if (!this.#hasSmtpConfig()) {
      throw new Error(
        'SMTP is not fully configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL.'
      );
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass
        }
      });
    }

    return this.transporter;
  }

  async sendOtpEmail({ toEmail, fullName, otp, expiresInMinutes }) {
    const transporter = this.#getTransporter();

    await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: toEmail,
      subject: 'Your OTP Code',
      text: `Hi ${fullName || 'there'}, your OTP code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
          <p>Hi ${fullName || 'there'},</p>
          <p>Your OTP code is:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:12px 0;">${otp}</p>
          <p>This code expires in ${expiresInMinutes} minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });
  }

  async sendTicketEmail({ toEmail, fullName, event, ticketCode, qrCodeDataUrl }) {
    const transporter = this.#getTransporter();
    const qrBase64 = String(qrCodeDataUrl || '').split(',')[1];
    const eventDate = event?.startDate
      ? new Date(event.startDate).toLocaleString()
      : 'Date not set';

    await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: toEmail,
      subject: `Your ticket for ${event?.title || 'AfterHour Events'}`,
      text: `Hi ${fullName || 'there'}, your booking is confirmed. Ticket code: ${ticketCode}. Event: ${event?.title || 'Untitled Event'} at ${event?.location || 'Location not set'} on ${eventDate}. Your QR ticket is attached.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
          <p>Hi ${fullName || 'there'},</p>
          <p>Your booking is confirmed.</p>
          <p><strong>Event:</strong> ${event?.title || 'Untitled Event'}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${event?.location || 'Location not set'}</p>
          <p><strong>Ticket Code:</strong> ${ticketCode}</p>
          <p>Show this QR code at the event entrance:</p>
          <img src="cid:ticket-qr" alt="Ticket QR Code" style="width:220px;height:220px;" />
        </div>
      `,
      attachments: qrBase64
        ? [
            {
              filename: `${ticketCode}.png`,
              content: qrBase64,
              encoding: 'base64',
              cid: 'ticket-qr'
            }
          ]
        : []
    });
  }
}

module.exports = new EmailService();
