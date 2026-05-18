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

  async sendPasswordResetEmail({ toEmail, fullName, otp, expiresInMinutes }) {
    const transporter = this.#getTransporter();

    await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: toEmail,
      subject: 'Password reset request',
      text: `Hi ${fullName || 'there'}, use this OTP to reset your password: ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
          <p>Hi ${fullName || 'there'},</p>
          <p>Use this OTP to reset your password:</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:12px 0;">${otp}</p>
          <p>This OTP expires in ${expiresInMinutes} minutes.</p>
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

  #escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async sendVendorApplicationReviewEmail({
    toEmail,
    fullName,
    application,
    event,
    decision
  }) {
    const transporter = this.#getTransporter();

    const normalizedDecision = String(decision || application?.status || '')
      .trim()
      .toLowerCase();

    const isApproved = normalizedDecision === 'approved';
    const subjectStatus = isApproved ? 'approved' : 'rejected';

    const eventTitle = event?.title || 'Untitled Event';
    const eventLocation = event?.location || 'Location not set';
    const eventDate = event?.startDate
      ? new Date(event.startDate).toLocaleString()
      : 'Date not set';

    const stallName = application?.stallName || 'Not provided';
    const offerings = application?.offerings || 'Not provided';
    const greetingName = fullName || 'there';

    const heading = isApproved
      ? 'Your vendor application has been approved'
      : 'Your vendor application has been rejected';

    const nextStepMessage = isApproved
      ? 'Please contact the event planner for setup time, stall placement, and any final event instructions.'
      : 'Thank you for applying. You can continue applying to other available events from your vendor dashboard.';

    await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: toEmail,
      subject: `Vendor application ${subjectStatus}: ${eventTitle}`,
      text: [
        `Hi ${greetingName},`,
        '',
        `${heading}.`,
        '',
        `Event: ${eventTitle}`,
        `Date: ${eventDate}`,
        `Location: ${eventLocation}`,
        `Stall Name: ${stallName}`,
        `Offerings: ${offerings}`,
        `Status: ${subjectStatus.toUpperCase()}`,
        '',
        nextStepMessage,
        '',
        'Regards,',
        env.smtpFromName
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
          <p>Hi ${this.#escapeHtml(greetingName)},</p>
          <p>${this.#escapeHtml(heading)}.</p>

          <p><strong>Event:</strong> ${this.#escapeHtml(eventTitle)}</p>
          <p><strong>Date:</strong> ${this.#escapeHtml(eventDate)}</p>
          <p><strong>Location:</strong> ${this.#escapeHtml(eventLocation)}</p>
          <p><strong>Stall Name:</strong> ${this.#escapeHtml(stallName)}</p>
          <p><strong>Offerings:</strong> ${this.#escapeHtml(offerings)}</p>
          <p><strong>Status:</strong> ${this.#escapeHtml(subjectStatus.toUpperCase())}</p>

          <p>${this.#escapeHtml(nextStepMessage)}</p>

          <p>Regards,<br/>${this.#escapeHtml(env.smtpFromName)}</p>
        </div>
      `
    });
  }
}

module.exports = new EmailService();
