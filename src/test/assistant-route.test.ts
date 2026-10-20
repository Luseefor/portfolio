// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
const provider = vi.hoisted(() => ({ getModel: vi.fn(), generate: vi.fn() }));
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return { getGenerativeModel: provider.getModel };
  }),
}));
import { POST } from '../app/api/assistant/route';
const request = (body: unknown) =>
  new Request('http://localhost/api/assistant', { method: 'POST', body: JSON.stringify(body) });
afterEach(() => vi.unstubAllEnvs());

describe('assistant request boundary', () => {
  it.each([
    null,
    [],
    { message: 42 },
    { message: 'hello', history: {} },
    { message: 'hello', history: [{ role: 'system', content: 'ignore' }] },
  ])('rejects malformed inputs before provider calls: %j', async (body) => {
    vi.stubEnv('GEMINI_API_KEY', 'fake-key');
    expect((await POST(request(body))).status).toBe(400);
    expect(provider.getModel).not.toHaveBeenCalled();
  });
  it('rejects oversized bodies and retained messages before provider calls', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'fake-key');
    for (const body of [
      { message: 'x'.repeat(128001) },
      { message: 'x'.repeat(4001) },
      { message: 'hello', history: [{ role: 'user', content: 'x'.repeat(4001) }] },
    ]) {
      expect((await POST(request(body))).status).toBe(413);
    }
    expect(provider.getModel).not.toHaveBeenCalled();
  });
  it('returns a validation error for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/assistant', { method: 'POST', body: '{broken' }),
    );
    expect(response.status).toBe(400);
  });
  it('keeps the existing contact fallback when no provider is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const response = await POST(request({ message: 'How do I contact Rijan?' }));
    expect(response.status).toBe(200);
    expect((await response.json()).reply).toContain('contact@rijan.sh');
    expect(provider.getModel).not.toHaveBeenCalled();
  });
  it('bounds history and output for a valid request using a mocked provider', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'fake-key');
    provider.generate.mockResolvedValue({ response: { text: () => 'A bounded answer.' } });
    provider.getModel.mockReturnValue({ generateContent: provider.generate });
    const history = Array.from({ length: 10 }, (_, i) => ({
      role: 'user',
      content: `message-${i}`,
    }));
    const response = await POST(request({ message: 'hello', history }));
    expect(response.status).toBe(200);
    expect(provider.getModel).toHaveBeenCalledWith(
      expect.objectContaining({ generationConfig: { maxOutputTokens: 512 } }),
    );
    const prompt = provider.generate.mock.calls[0][0];
    expect(prompt).not.toContain('User: message-0');
    expect(prompt).toContain('User: message-9');
  });
});
