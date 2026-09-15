const axios = require('axios');

const ALERT_LEVELS = new Set(['medium', 'high']);

const displayRiskLevel = (level) => `${level.charAt(0).toUpperCase()}${level.slice(1)}`;

const createRiskAlertEmail = ({ student, forecast }) => {
  const riskLevel = displayRiskLevel(forecast.riskLevel);
  const probability = Math.round(Number(forecast.dropoutProbability) * 100);
  const appUrl = process.env.PUBLIC_APP_URL || process.env.CLIENT_ORIGIN?.split(',')[0] || 'http://localhost:3000';

  return `
    <main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.55">
      <h1 style="color:#0d47a1">We're here to support you</h1>
      <p>Hello ${student.fullName},</p>
      <p>Your latest academic forecast has been marked as <strong>${riskLevel.toLowerCase()} support risk</strong> (${probability}% estimated attrition risk). This is an early-support signal, not a decision, diagnosis, or prediction of your potential.</p>
      <p>Small, timely steps can make a difference. Please review your forecast and consider speaking with a professor, adviser, or student-support service about attendance, coursework, finances, or any barriers you are facing.</p>
      <p style="margin:28px 0"><a href="${appUrl}" style="background:#0d47a1;color:#fff;padding:12px 18px;border-radius:4px;text-decoration:none">Review my forecast</a></p>
      <p>If you believe this information is incomplete or no longer reflects your circumstances, update your academic information and run a new forecast.</p>
      <p>Retainify Student Support</p>
    </main>`;
};

const isRiskAlertLevel = (riskLevel) => ALERT_LEVELS.has(String(riskLevel || '').toLowerCase());

const sendRiskAlertEmail = async ({ student, forecast }) => {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    throw new Error('Risk alert email is not configured.');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'Retainify',
      },
      to: [{ email: student.email, name: student.fullName }],
      subject: `Academic support check-in: ${displayRiskLevel(forecast.riskLevel)} support risk`,
      htmlContent: createRiskAlertEmail({ student, forecast }),
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      timeout: 10000,
    }
  );
};

module.exports = { isRiskAlertLevel, sendRiskAlertEmail };
