const crypto = require('crypto');
const QRCode = require('qrcode');

function buildQrPayload({ ticketCode, registrationId, eventId, userId }) {
  return JSON.stringify({
    ticketCode,
    registrationId: String(registrationId),
    eventId: String(eventId),
    userId: String(userId),
    issuedAt: new Date().toISOString()
  });
}

async function createTicketArtifacts({ registrationId, eventId, userId }) {
  const ticketCode = `AHE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const qrPayload = buildQrPayload({ ticketCode, registrationId, eventId, userId });
  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320
  });

  return {
    ticketCode,
    qrPayload,
    qrCodeDataUrl
  };
}

module.exports = {
  createTicketArtifacts
};
