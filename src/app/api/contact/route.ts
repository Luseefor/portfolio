import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  context?: unknown;
  company?: unknown;
};

function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() ?? '';
  const user = process.env.SMTP_USER?.trim() ?? '';
  const pass = process.env.SMTP_PASS ?? '';
  const to = process.env.CONTACT_EMAIL?.trim() || user;
  const from = process.env.SMTP_FROM?.trim() || user;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'Portfolio Contact';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  if (!host || !user || !pass || !to || !from || Number.isNaN(port)) {
    return null;
  }

  return { host, user, pass, to, from, fromName, port, secure };
}

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  const config = parseSmtpConfig();
  if (!config) {
    throw new Error('SMTP configuration is incomplete.');
  }

  transporterPromise = (async () => {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.verify();
    return transporter;
  })();

  try {
    return await transporterPromise;
  } catch (error) {
    transporterPromise = null;
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;
    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email);
    const message = sanitizeText(body.message);
    const context = sanitizeText(body.context);
    const company = sanitizeText(body.company);

    if (company) {
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 },
      );
    }

    if (name.length > 120 || email.length > 200 || context.length > 200 || message.length > 4000) {
      return NextResponse.json(
        { error: 'One or more fields are too long.' },
        { status: 400 },
      );
    }

    const smtpConfig = parseSmtpConfig();
    if (!smtpConfig) {
      return NextResponse.json(
        {
          error:
            'Contact delivery is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_EMAIL.',
        },
        { status: 500 },
      );
    }

    const transporter = await getTransporter();

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.from}>`,
      replyTo: email,
      to: smtpConfig.to,
      subject: `Portfolio Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nContext: ${context || 'Not provided'}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; color: #111827;">
          <h2>New Portfolio Contact Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Context:</strong> ${escapeHtml(context || 'Not provided')}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. I will get back to you soon.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error('Contact API SMTP error:', message);
    return NextResponse.json(
      { error: 'Failed to send the message right now. Please try again later.' },
      { status: 500 },
    );
  }
}
