import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📨 Contact Form Submission Received:', { name, email, message });

    // Check for SMTP configuration
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn(
        '⚠️ SMTP Configuration missing. Email will NOT be sent. Logged to console only.',
      );
      // Return success in dev mode so the UI feels responsive
      return NextResponse.json({
        success: true,
        message: 'Message received (Simulation Mode: Configure SMTP to send real emails)',
      });
    }

    // Configure Transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Boolean(process.env.SMTP_SECURE) || false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send Email
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Note: Some providers override this to the auth user
      to: CONTACT_EMAIL || SMTP_USER, // Default to sending to yourself
      subject: `Portfolio Contact: ${name}`,
      text: message,
      html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('❌ Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
