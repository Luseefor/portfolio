// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const provider = vi.hoisted(() => ({ getModel: vi.fn(), generate: vi.fn() }));
vi.mock('@google/generative-ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/generative-ai')>();
  return {
    ...actual,
    GoogleGenerativeAI: vi.fn().mockImplementation(function () {
      return { getGenerativeModel: provider.getModel };
    }),
  };
});
import { GET, POST } from '../app/api/workbench/route';
const request = (body: unknown) =>
  new Request('http://localhost/api/workbench', { method: 'POST', body: JSON.stringify(body) });
const plan = {
  operation: 'create',
  kind: 'wave',
  amplitude: 1,
  frequency: 1.5,
  automate: true,
  summary: 'Create a wave and run a frequency sweep.',
};
beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'fake-key');
  vi.stubEnv('WORKBENCH_AI_MODEL', 'configured-test-model');
  provider.getModel.mockReturnValue({ generateContent: provider.generate });
});
afterEach(() => {
  vi.unstubAllEnvs();
});
describe('bounded workbench planner', () => {
  it('reports configuration without returning keys or model names', async () => {
    const response = GET();
    expect(await response.json()).toEqual({ configured: true });
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await GET().json()).toEqual({ configured: false });
  });
  it.each([
    null,
    [],
    { message: 1 },
    { message: ' ' },
    { message: 'wave', selected: { id: 'bad' } },
  ])('rejects malformed requests %j', async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(provider.generate).not.toHaveBeenCalled();
  });
  it('rejects invalid JSON and oversized prompts', async () => {
    expect(
      (await POST(new Request('http://localhost/api/workbench', { method: 'POST', body: '{bad' })))
        .status,
    ).toBe(400);
    expect((await POST(request({ message: 'x'.repeat(1001) }))).status).toBe(413);
    expect((await POST(request({ message: 'x'.repeat(8001) }))).status).toBe(413);
    expect(provider.generate).not.toHaveBeenCalled();
  });
  it('returns setup status rather than a fabricated AI plan', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect((await POST(request({ message: 'Create a wave' }))).status).toBe(503);
    expect(provider.generate).not.toHaveBeenCalled();
  });
  it('returns only a validated plan from a bounded provider call', async () => {
    provider.generate.mockResolvedValue({ response: { text: () => JSON.stringify(plan) } });
    const response = await POST(request({ message: 'Create a wave and automate a sweep' }));
    expect(await response.json()).toEqual({ plan, source: 'gemini' });
    expect(provider.getModel).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: expect.objectContaining({
          maxOutputTokens: 384,
          responseMimeType: 'application/json',
        }),
      }),
      { timeout: 20000 },
    );
  });
  it.each([
    { ...plan, frequency: Infinity },
    { ...plan, operation: 'execute-shell' },
    { ...plan, kind: 'saddle' },
    { ...plan, operation: 'update' },
  ])('rejects unsupported provider actions %j', async (invalid) => {
    provider.generate.mockResolvedValue({ response: { text: () => JSON.stringify(invalid) } });
    expect((await POST(request({ message: 'create' }))).status).toBe(422);
  });
  it('handles provider errors without exposing configuration', async () => {
    provider.generate.mockRejectedValue(new Error('secret fake-key'));
    const response = await POST(request({ message: 'create' }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('fake-key');
  });
});
