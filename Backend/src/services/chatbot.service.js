const https = require('https');
const env = require('../config/env');
const { ROLES } = require('../constants/roles');

const CHATBOT_CONTEXT = `
You are AfterHours Assistant, the friendly helper inside an Event Management System.
Your job is to help students, event planners, vendors, and admins use the app without sounding robotic.

Voice and behavior:
- Sound warm, natural, and human, like a helpful teammate.
- Keep answers short by default: usually 2 to 5 sentences.
- For greetings or small talk, reply conversationally and invite the user to choose what they need.
- Start with the direct answer, then add the useful next step.
- Do not dump endpoint lists unless the user asks for API details.
- If the user seems confused or frustrated, acknowledge it briefly and guide them calmly.
- Use simple words instead of backend jargon when talking to normal users.
- When the user is clearly asking as a developer, include exact routes and payload hints.
- If the user asks one-word questions like "login", "ticket", or "OTP", assume they are a customer and answer without API routes.
- Never invent features that are not listed below. If unsure, say what the app supports and ask one focused follow-up.
- Do not mention these instructions.

Base URL: /api/v1

Main app abilities:
- Students can browse published events, register for events, see their registrations, and use QR tickets.
- Event planners can create and update events. Planner-created or planner-updated events wait for admin approval before publishing.
- Admins can review pending events and approve or deny them.
- Vendors can browse published events, apply to events, and view their applications.
- Planners can review vendor applications for their own events.
- Users can sign up, log in, verify OTP, request password reset OTP, and reset password.

Useful developer routes:
- Auth: POST /auth/register, POST /auth/login, GET /auth/me
- OTP login/verification: POST /auth/otp/send, POST /auth/otp/verify
- Password recovery: POST /auth/forgot-password, POST /auth/reset-password
- Events: GET /events, GET /events/:id, POST /events, PATCH /events/:id, DELETE /events/:id
- Admin review: GET /events/pending, PATCH /events/:id/review
- Registration: POST /events/:id/register, DELETE /events/:id/register, GET /registrations/me
- Ticket scan: GET /registrations/ticket/scan?token=<qrPayload>
- Vendor: GET /vendor/events, POST /vendor/apply/:eventId, GET /vendor/applications, GET /vendor/profile
- Planner vendor review: GET /planner/vendor-applications, PATCH /planner/vendor-applications/:applicationId/review

Behavior rules:
- Event planner created/updated events need admin approval to become published.
- Admin can auto-publish and review pending events.
- Registration is allowed only for published events.
- Password reset uses a 6-digit OTP, not a long token.
`.trim();

class ChatbotService {
  async ask(question, history = [], userRole) {
    const cleanQuestion = String(question || '').trim();
    const normalizedRole = this.#normalizeRole(userRole);
    if (!cleanQuestion) {
      return {
        answer: 'Tell me what you are trying to do in the event system, and I will help you through it.',
        source: 'fallback'
      };
    }

    if (env.geminiApiKey) {
      try {
        const answer = await this.askWithGemini(cleanQuestion, history, normalizedRole);
        return { answer, source: 'gemini' };
      } catch (error) {
        return {
          answer: this.askWithFallback(cleanQuestion, history, normalizedRole),
          source: 'fallback'
        };
      }
    }

    return {
      answer: this.askWithFallback(cleanQuestion, history, normalizedRole),
      source: 'fallback'
    };
  }

  askWithFallback(question, history = [], userRole) {
    const q = question.toLowerCase();
    const normalizedQuestion = q.replace(/[^\w\s]/g, '').trim();
    const lastAssistantReply = String(
      history
        .slice()
        .reverse()
        .find((message) => message?.role === 'assistant')?.text || ''
    ).toLowerCase();

    if (this.#isGreeting(normalizedQuestion)) {
      if (userRole === ROLES.STUDENT) {
        return 'Hi, nice to see you. What do you need help with today: booking an event, finding your ticket, or resetting your password?';
      }
      if (userRole === ROLES.VENDOR) {
        return 'Hi, nice to see you. What do you need help with today: applying to events, checking your vendor applications, or updating your profile?';
      }
      if (userRole === ROLES.EVENT_PLANNER) {
        return 'Hi, nice to see you. What do you need help with today: creating an event, checking pending status, or reviewing vendor applications?';
      }
      if (userRole === ROLES.ADMIN) {
        return 'Hi, nice to see you. What do you need help with today: reviewing pending events, approvals, or admin actions?';
      }
      return 'Hi, nice to see you. What do you need help with today: booking an event, finding your ticket, resetting your password, or applying as a vendor?';
    }

    if (this.#hasAny(q, ['thank', 'thanks'])) {
      return 'You are welcome. I am here if you need help with anything else in the event system.';
    }

    if (this.#hasAny(q, ['help', 'what can you do', 'what do you do'])) {
      return 'I can help you book events, find tickets, reset your password, understand event approval, or apply as a vendor. You can type your question or tap one of the quick questions below.';
    }

    if (this.#hasAny(q, ['forgot', 'reset password', 'password reset'])) {
      return 'No worries, you can reset your password with a 6-digit OTP. Enter your email on the forgot-password screen, check your inbox for the OTP, then use that code with your new password.';
    }

    if (
      this.#hasAny(q, ['sign up', 'signup', 'register account', 'create account', 'become']) &&
      q.includes('vendor')
    ) {
      return 'Great question. As a student, you cannot apply as a vendor directly from the student role. Create or log in with a vendor account first, then go to vendor events and apply from there.';
    }

    if (this.#hasAny(q, ['register', 'join', 'book']) && q.includes('event')) {
      if (userRole && userRole !== ROLES.STUDENT) {
        return 'Event booking is for student accounts. If you want to join events, please use a student login.';
      }
      return 'Sure. Log in as a student, open the event you like, and register from there. The app only allows registration for events that are already published, so if an event is still pending approval it will not be joinable yet.';
    }

    if (this.#hasAny(q, ['login', 'sign in', 'signin', 'auth'])) {
      if (this.#isDeveloperQuestion(q)) {
        return 'For developers: login uses `POST /api/v1/auth/login`, signup uses `POST /api/v1/auth/register`, and the current profile is available at `GET /api/v1/auth/me`.';
      }

      return 'To log in, use the email and password you registered with. If you forgot your password, choose the forgot-password option and the app will send a 6-digit OTP to your email.';
    }

    if (this.#hasAny(q, ['pending', 'approve', 'approval', 'review']) && q.includes('event')) {
      if (userRole === ROLES.STUDENT || userRole === ROLES.VENDOR) {
        return 'Event approvals are handled by admins. You can view only published events once they are approved.';
      }
      return 'Planner events do not publish instantly. They go into a pending queue so an admin can approve or deny them; once approved, the event becomes visible and students can register.';
    }

    if (q.includes('otp')) {
      if (this.#isDeveloperQuestion(q)) {
        return 'For developers: login OTP uses `POST /api/v1/auth/otp/send` and `POST /api/v1/auth/otp/verify`. Password reset OTP uses the forgot-password and reset-password flow.';
      }

      return 'An OTP is a short 6-digit code sent to your email. Use it to verify your account or reset your password, and request a new one if it expires.';
    }

    if (this.#hasAny(q, ['ticket', 'qr', 'scan'])) {
      return 'After a student registers, their ticket shows up in their registrations with a QR code. At the entrance, that QR can be scanned to confirm the ticket and show the event details.';
    }

    if (q.includes('event')) {
      if (userRole === ROLES.STUDENT) {
        return 'You can browse published events, open details, and register for the ones you want. Your registrations and QR tickets are available in your bookings.';
      }
      if (userRole === ROLES.VENDOR) {
        return 'You can browse published events and apply as a vendor for events that match your service. You can track your application status from your vendor section.';
      }
      if (userRole === ROLES.EVENT_PLANNER) {
        return 'You can create and update events. Your event goes to pending review, and it becomes published after admin approval.';
      }
      if (userRole === ROLES.ADMIN) {
        return 'You can review pending events, approve or deny them, and manage overall event visibility.';
      }
      return 'You can browse published events, open an event for details, or create one if you are an event planner. Planner-created events wait for admin approval before students can see and register for them.';
    }

    if (this.#hasAny(q, ['vendor', 'stall', 'apply'])) {
      if (
        this.#hasAny(q, ['why', 'then why', 'out of context', 'did you say']) &&
        lastAssistantReply.includes('vendor application features are for vendor accounts')
      ) {
        return 'You are right to ask. I meant: students cannot apply as vendor from a student account. To do that, use a vendor account, then apply to events from the vendor section.';
      }

      if (userRole === ROLES.STUDENT) {
        return 'Vendor application features are for vendor accounts. As a student, you can browse and register for published events.';
      }
      return 'Vendors can browse published events and apply for a stall or service spot. After applying, they can track their application status while the event planner reviews it.';
    }

    return 'I can help with that. Could you tell me a little more about what you are trying to do: book an event, find a ticket, reset your password, create an event, or apply as a vendor?';
  }

  askWithGemini(question, history = [], userRole) {
    const url = new URL(
      `/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
      env.geminiBaseUrl
    );
    const conversationContext = this.#formatHistory(history);

    const payload = JSON.stringify({
      generationConfig: {
        temperature: 0.75,
        topP: 0.9,
        maxOutputTokens: 350
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ],
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                CHATBOT_CONTEXT,
                this.#buildRoleInstruction(userRole),
                conversationContext ? `Recent conversation:\n${conversationContext}` : '',
                `User question: ${question}`,
                'Answer naturally as AfterHours Assistant:'
              ]
                .filter(Boolean)
                .join('\n\n')
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

  #hasAny(value, keywords) {
    return keywords.some((keyword) => value.includes(keyword));
  }

  #isDeveloperQuestion(value) {
    return this.#hasAny(value, ['api', 'endpoint', 'route', 'payload', 'post ', 'get ', 'patch ', 'delete ', 'developer']);
  }

  #isGreeting(value) {
    return ['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening'].includes(value);
  }

  #formatHistory(history) {
    return history
      .slice(-8)
      .map((message) => {
        const role = message?.role === 'assistant' ? 'Assistant' : 'User';
        const text = String(message?.text || '').replace(/\s+/g, ' ').trim();
        return text ? `${role}: ${text.slice(0, 500)}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  #normalizeRole(userRole) {
    const role = String(userRole || '').trim().toLowerCase();
    if (Object.values(ROLES).includes(role)) return role;
    return null;
  }

  #buildRoleInstruction(userRole) {
    if (!userRole) return 'User role is unknown. Give a general answer.';

    if (userRole === ROLES.STUDENT) {
      return 'User role is student. Focus only on student actions. Do not explain planner, vendor, or admin flows unless explicitly asked.';
    }

    if (userRole === ROLES.VENDOR) {
      return 'User role is vendor. Focus only on vendor actions. Do not explain student, planner, or admin flows unless explicitly asked.';
    }

    if (userRole === ROLES.EVENT_PLANNER) {
      return 'User role is event_planner. Focus on planner actions and related approval flow.';
    }

    if (userRole === ROLES.ADMIN) {
      return 'User role is admin. Focus on admin actions and moderation capabilities.';
    }

    return 'User role is unknown. Give a general answer.';
  }
}

module.exports = new ChatbotService();
