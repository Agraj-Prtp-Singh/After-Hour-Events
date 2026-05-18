const https = require('https');
const env = require('../config/env');

const BACKEND_KNOWLEDGE = `
You are the Event Management System backend assistant.
Help users understand navigation and backend features clearly.

Base URL: /api/v1
Important routes:
- GET /health
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/otp/send
- POST /auth/otp/verify
- POST /events
- GET /events
- GET /events/:id
- PATCH /events/:id
- DELETE /events/:id
- GET /events/pending (admin)
- PATCH /events/:id/review (admin)
- POST /events/:id/register
- DELETE /events/:id/register
- GET /registrations/me
- GET /registrations/ticket/scan?token=<qrPayload>

Behavior rules:
- Event planner created/updated events need admin approval to become published.
- Admin can auto-publish and review pending events.
- Registration is allowed only for published events.
`.trim();

class ChatbotService {
  async ask(question) {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) {
      return {
        answer: 'Please ask a question so I can help you navigate the system.',
        source: 'fallback'
      };
    }

    if (env.geminiApiKey) {
      try {
        const answer = await this.askWithGemini(cleanQuestion);
        return { answer, source: 'gemini' };
      } catch (error) {
        return {
          answer: this.askWithFallback(cleanQuestion),
          source: 'fallback'
        };
      }
    }

    return {
      answer: this.askWithFallback(cleanQuestion),
      source: 'fallback'
    };
  }

  askWithFallback(question) {
    const q = question.toLowerCase();

    if (q.includes('register') && q.includes('event')) {
      return 'To register for an event, simply register as a student and you can join events or register as a planner to host events!';
    }

    if (q.includes('login') || q.includes('sign in') || q.includes('auth')) {
      return 'Use POST /api/v1/auth/login for login, POST /api/v1/auth/register for signup, and GET /api/v1/auth/me to fetch the logged-in user profile.';
    }

    if (q.includes('pending') || q.includes('approve') || q.includes('review')) {
      return 'Admins review events using GET /api/v1/events/pending and PATCH /api/v1/events/:id/review with decision=approved or denied.';
    }

    if (q.includes('otp')) {
      return 'OTP flow uses POST /api/v1/auth/otp/send to send code and POST /api/v1/auth/otp/verify to verify and receive a token.';
    }

    if (q.includes('ticket') || q.includes('qr')) {
      return 'For tickets, use GET /api/v1/registrations/me to get qrPayload and GET /api/v1/registrations/ticket/scan?token=<qrPayload> to resolve ticket details.';
    }

    if (q.includes('event')) {
      return 'For events, use GET /api/v1/events to browse published events and GET /api/v1/events/:id for details. Event creation is POST /api/v1/events (auth required).';
    }

    return 'I can help with auth, events, registrations, OTP, and admin review flow. Ask things like "how do I register for an event?" or "how does event approval work?"';
  }

  askWithGemini(question) {
    const url = new URL(
      `/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
      env.geminiBaseUrl
    );

    const payload = JSON.stringify({
      generationConfig: {
        temperature: 0.2
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${BACKEND_KNOWLEDGE}\n\nUser question: ${question}`
            }
          ]
        }
      ]
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`Gemini request failed with status ${res.statusCode}`));
            }

            try {
              const parsed = JSON.parse(body);
              const answer = parsed?.candidates?.[0]?.content?.parts
                ?.map((part) => part?.text || '')
                .join('')
                .trim();
              if (!answer) {
                return reject(new Error('Empty response from Gemini'));
              }
              resolve(answer);
            } catch (error) {
              reject(new Error('Failed to parse Gemini response'));
            }
          });
        }
      );

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = new ChatbotService();
