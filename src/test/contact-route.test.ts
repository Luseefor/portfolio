/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  sendMail: vi.fn(),
  createTransport: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: mocks.createTransport },
  createTransport: mocks.createTransport,
}));

function setSmtpEnv() {
  vi.stubEnv('SMTP_HOST', 'smtp.example.com');
  vi.stubEnv('SMTP_PORT', '587');
  vi.stubEnv('SMTP_USER', 'relay@example.com');
  vi.stubEnv('SMTP_PASS', 'fake-pass');
  vi.stubEnv('CONTACT_EMAIL', 'owner@example.com');
  vi.stubEnv('SMTP_FROM', 'no-reply@example.com');
  vi.stubEnv('SMTP_FROM_NAME', 'Portfolio Contact');
}

async function loadPost() {
  const mod = await import('../app/api/contact/route');
  return mod.POST;
}

function postRequest(payload: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  mocks.createTransport.mockReturnValue({
    verify: mocks.verify,
    sendMail: mocks.sendMail,
  });
  mocks.verify.mockResolvedValue(undefined);
  mocks.sendMail.mockResolvedValue({ messageId: 'fake-id' });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('contact route transport contract', () => {
  it('uses server from and to with visitor address only as replyTo', async () => {
    setSmtpEnv();
    const POST = await loadPost();

    const res = await POST(
      postRequest({ name: 'Ada', email: 'visitor@example.com', message: 'Hello' }),
    );
    expect(res.status).toBe(200);
    expect(mocks.createTransport).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);

    const mail = mocks.sendMail.mock.calls[0][0] as Record<string, unknown>;
    expect(mail.to).toBe('owner@example.com');
    expect(String(mail.from)).toContain('no-reply@example.com');
    expect(String(mail.from)).not.toContain('visitor@example.com');
    expect(mail.replyTo).toBe('visitor@example.com');
  });

  it('escapes HTML in name, email, and message', async () => {
    setSmtpEnv();
    const POST = await loadPost();

    await POST(
      postRequest({
        name: '<b>Ada</b>',
        email: 'visitor@example.com',
        message: '<script>alert(1)</script>',
      }),
    );

    const mail = mocks.sendMail.mock.calls[0][0] as Record<string, unknown>;
    const html = String(mail.html);
    expect(html).toContain('&lt;b&gt;Ada&lt;/b&gt;');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('rejects missing fields and malformed email without sending', async () => {
    setSmtpEnv();
    const POST = await loadPost();

    const missing = await POST(postRequest({ name: 'Ada', email: 'visitor@example.com' }));
    expect(missing.status).toBe(400);

    const badEmail = await POST(
      postRequest({ name: 'Ada', email: 'not-an-email', message: 'Hi' }),
    );
    expect(badEmail.status).toBe(400);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it('rejects oversize name, email, context, and message', async () => {
    setSmtpEnv();
    const POST = await loadPost();

    const longName = await POST(
      postRequest({ name: 'a'.repeat(121), email: 'visitor@example.com', message: 'Hi' }),
    );
    expect(longName.status).toBe(400);

    const longMessage = await POST(
      postRequest({ name: 'Ada', email: 'visitor@example.com', message: 'x'.repeat(4001) }),
    );
    expect(longMessage.status).toBe(400);

    const longContext = await POST(
      postRequest({
        name: 'Ada',
        email: 'visitor@example.com',
        message: 'Hi',
        context: 'c'.repeat(201),
      }),
    );
    expect(longContext.status).toBe(400);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it('returns missing config without touching SMTP', async () => {
    const POST = await loadPost();

    const res = await POST(
      postRequest({ name: 'Ada', email: 'visitor@example.com', message: 'Hello' }),
    );
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error?: string };
    expect(body.error ?? '').toContain('not configured');
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it('returns a generic error when delivery fails', async () => {
    setSmtpEnv();
    mocks.sendMail.mockRejectedValueOnce(new Error('smtp boom secret detail'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const POST = await loadPost();
      const res = await POST(
        postRequest({ name: 'Ada', email: 'visitor@example.com', message: 'Hello' }),
      );
      expect(res.status).toBe(500);
      const body = (await res.json()) as { error?: string };
      expect(body.error).toBe('Failed to send the message right now. Please try again later.');
      expect(body.error ?? '').not.toContain('smtp boom');
    } finally {
      errSpy.mockRestore();
    }
  });
});
