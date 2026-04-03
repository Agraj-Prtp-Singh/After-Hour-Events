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
}

module.exports = new EmailService();
