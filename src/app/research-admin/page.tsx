'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, RefreshCcw, Save, Trash2, Plus } from 'lucide-react';
import RouteThemeControl from '@/components/shared/RouteThemeControl';
import { useStore } from '@/utils/store';
import { getThemeColor, hexToRgba } from '@/utils/themes';
import type { ResearchSourceConfig } from '@/lib/research/types';

type SourceFormState = {
  id: string;
  name: string;
  enabled: boolean;
  kind: ResearchSourceConfig['kind'];
  endpoint: string;
  method: ResearchSourceConfig['method'];
  authType: ResearchSourceConfig['authType'];
  authEnvKey: string;
  timeoutMs: string;
  priority: string;
  headersJson: string;
  queryJson: string;
  mappingJson: string;
};

const ADMIN_TOKEN_KEY = 'research-admin-token';

const DEFAULT_MAPPING_JSON = JSON.stringify(
  {
    itemsPath: 'data.items',
    titlePath: 'title',
    urlPath: 'url',
    datePath: 'publishedAt',
    summaryPath: 'summary',
    authorsPath: 'authors',
    tagsPath: 'tags',
    typePath: 'type',
  },
  null,
  2,
);

function defaultFormState(): SourceFormState {
  return {
    id: '',
    name: '',
    enabled: true,
    kind: 'mixed',
    endpoint: '',
    method: 'GET',
    authType: 'none',
    authEnvKey: '',
    timeoutMs: '6000',
    priority: '10',
    headersJson: '{}',
    queryJson: '{}',
    mappingJson: DEFAULT_MAPPING_JSON,
  };
}

function parseStringMap(text: string, fieldName: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '{}') {
    return { value: undefined as Record<string, string> | undefined };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: `${fieldName} must be valid JSON.` };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: `${fieldName} must be an object.` };
  }

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      return { error: `${fieldName}.${key} must be a string.` };
    }
    record[key] = value;
  }

  return { value: record };
}

function parseMapping(text: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Mapping must be valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'Mapping must be a JSON object.' };
  }

  const mapping = parsed as Record<string, unknown>;
  if (
    typeof mapping.itemsPath !== 'string' ||
    typeof mapping.titlePath !== 'string' ||
    typeof mapping.urlPath !== 'string'
  ) {
    return {
      error: 'mapping.itemsPath, mapping.titlePath, and mapping.urlPath are required string fields.',
    };
  }

  return {
    value: {
      itemsPath: mapping.itemsPath,
      titlePath: mapping.titlePath,
      urlPath: mapping.urlPath,
      ...(typeof mapping.datePath === 'string' ? { datePath: mapping.datePath } : {}),
      ...(typeof mapping.summaryPath === 'string' ? { summaryPath: mapping.summaryPath } : {}),
      ...(typeof mapping.authorsPath === 'string' ? { authorsPath: mapping.authorsPath } : {}),
      ...(typeof mapping.tagsPath === 'string' ? { tagsPath: mapping.tagsPath } : {}),
      ...(typeof mapping.typePath === 'string' ? { typePath: mapping.typePath } : {}),
    } satisfies ResearchSourceConfig['mapping'],
  };
}

function sourceToForm(source: ResearchSourceConfig): SourceFormState {
  return {
    id: source.id,
    name: source.name,
    enabled: source.enabled,
    kind: source.kind,
    endpoint: source.endpoint,
    method: source.method,
    authType: source.authType,
    authEnvKey: source.authEnvKey ?? '',
    timeoutMs: String(source.timeoutMs),
    priority: String(source.priority),
    headersJson: JSON.stringify(source.headers ?? {}, null, 2),
    queryJson: JSON.stringify(source.query ?? {}, null, 2),
    mappingJson: JSON.stringify(source.mapping, null, 2),
  };
}

export default function ResearchAdminPage() {
  const currentTheme = useStore((state) => state.currentTheme);
  const isDark = useStore((state) => state.isDark);
  const accent = useMemo(() => getThemeColor(currentTheme, isDark), [currentTheme, isDark]);

  const [token, setToken] = useState('');
  const [sources, setSources] = useState<ResearchSourceConfig[]>([]);
  const [form, setForm] = useState<SourceFormState>(() => defaultFormState());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('Provide your admin token to manage sources.');

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [token]);

  const fetchWithToken = async (url: string, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-admin-token': token,
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  };

  const loadSources = async () => {
    if (!token) {
      setStatus('Admin token is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithToken('/api/research/sources', {
        method: 'GET',
      });
      const payload = (await response.json()) as { sources?: ResearchSourceConfig[]; message?: string };

      if (!response.ok) {
        setStatus(payload.message ?? 'Unable to load sources.');
        setSources([]);
        return;
      }

      setSources(payload.sources ?? []);
      setStatus(`Loaded ${payload.sources?.length ?? 0} source(s).`);
    } catch {
      setStatus('Request failed while loading sources.');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      setStatus('Admin token is required.');
      return;
    }

    const headersResult = parseStringMap(form.headersJson, 'headers');
    if (headersResult.error) {
      setStatus(headersResult.error);
      return;
    }

    const queryResult = parseStringMap(form.queryJson, 'query');
    if (queryResult.error) {
      setStatus(queryResult.error);
      return;
    }

    const mappingResult = parseMapping(form.mappingJson);
    if (!mappingResult.value) {
      setStatus(mappingResult.error ?? 'Invalid mapping JSON.');
      return;
    }

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      enabled: form.enabled,
      kind: form.kind,
      endpoint: form.endpoint.trim(),
      method: form.method,
      authType: form.authType,
      authEnvKey: form.authEnvKey.trim() || undefined,
      timeoutMs: Number(form.timeoutMs),
      priority: Number(form.priority),
      headers: headersResult.value,
      query: queryResult.value,
      mapping: mappingResult.value,
    };

    setLoading(true);
    try {
      const endpoint = editingId ? `/api/research/sources/${editingId}` : '/api/research/sources';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetchWithToken(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus(result.message ?? 'Failed to save source configuration.');
        return;
      }

      setStatus(editingId ? 'Source updated.' : 'Source created.');
      setEditingId(null);
      setForm(defaultFormState());
      await loadSources();
    } catch {
      setStatus('Failed to save source configuration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (source: ResearchSourceConfig) => {
    if (!token) {
      setStatus('Admin token is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithToken(`/api/research/sources/${source.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus(result.message ?? 'Failed to toggle source status.');
        return;
      }

      setStatus(`Source ${source.name} is now ${source.enabled ? 'disabled' : 'enabled'}.`);
      await loadSources();
    } catch {
      setStatus('Failed to toggle source status.');
    } finally {
      setLoading(false);
    }
  };

  const removeSource = async (source: ResearchSourceConfig) => {
    if (!token) {
      setStatus('Admin token is required.');
      return;
    }

    const confirmed = window.confirm(`Delete source ${source.name}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetchWithToken(`/api/research/sources/${source.id}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus(result.message ?? 'Failed to delete source.');
        return;
      }

      setStatus(`Deleted source ${source.name}.`);
      await loadSources();
    } catch {
      setStatus('Failed to delete source.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`relative min-h-screen px-6 py-16 ${isDark ? 'text-white' : 'text-slate-900'}`}
      style={{
        backgroundColor: isDark ? '#050507' : '#f8fafc',
        backgroundImage: `radial-gradient(circle at 30% 10%, ${hexToRgba(accent, isDark ? 0.2 : 0.16)} 0%, transparent 45%)`,
      }}
    >
      <Link
        href="/research"
        className={`absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal transition ${
          isDark
            ? 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/30'
            : 'border-black/10 bg-white/80 text-slate-700 hover:border-black/30'
        }`}
      >
        <ArrowLeft size={12} style={{ color: accent }} />
        Research
      </Link>

      <RouteThemeControl className="absolute right-6 top-6" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className={`text-[11px] uppercase tracking-[0.4em] font-terminal ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
            Research Admin
          </p>
          <h1 className={`mt-2 text-3xl font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            API Source Control
          </h1>
        </div>

        <section
          className={`mb-8 rounded-2xl border p-4 ${
            isDark ? 'border-white/10 bg-black/35' : 'border-black/10 bg-white/80'
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex-1">
              <span className={`mb-1 block text-[11px] uppercase tracking-[0.24em] font-terminal ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Admin Token
              </span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                  isDark
                    ? 'border-white/15 bg-white/[0.03] text-white placeholder:text-white/30'
                    : 'border-black/15 bg-white text-slate-900 placeholder:text-slate-400'
                }`}
                placeholder="Enter RESEARCH_ADMIN_TOKEN"
              />
            </label>
            <button
              onClick={() => {
                void loadSources();
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal transition ${
                isDark
                  ? 'border-white/20 bg-white/[0.04] text-white/85 hover:border-white/35'
                  : 'border-black/20 bg-white text-slate-800 hover:border-black/35'
              }`}
            >
              <RefreshCcw size={12} />
              Sync
            </button>
          </div>
          <p className={`mt-3 text-sm ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>{status}</p>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section
            className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-black/35' : 'border-black/10 bg-white/80'
            }`}
          >
            <h2 className={`mb-4 text-lg font-black uppercase tracking-[0.16em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Source Registry
            </h2>

            <div className="space-y-3">
              {sources.map((source) => (
                <article
                  key={source.id}
                  className={`rounded-xl border p-3 ${
                    isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-white'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{source.name}</p>
                      <p className={`text-[11px] uppercase tracking-[0.18em] font-terminal ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                        {source.id}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-terminal ${
                        source.enabled
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-emerald-100 text-emerald-700'
                          : isDark
                            ? 'bg-white/10 text-white/55'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className={`text-xs break-all ${isDark ? 'text-slate-300/85' : 'text-slate-600'}`}>{source.endpoint}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingId(source.id);
                        setForm(sourceToForm(source));
                        setStatus(`Editing ${source.name}.`);
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal ${
                        isDark ? 'border-white/15 text-white/70' : 'border-black/15 text-slate-700'
                      }`}
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        void toggleEnabled(source);
                      }}
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal ${
                        isDark ? 'border-white/15 text-white/70' : 'border-black/15 text-slate-700'
                      }`}
                    >
                      {source.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        void removeSource(source);
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal ${
                        isDark ? 'border-red-500/40 text-red-200' : 'border-red-500/40 text-red-700'
                      }`}
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            className={`rounded-2xl border p-4 ${
              isDark ? 'border-white/10 bg-black/35' : 'border-black/10 bg-white/80'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-black uppercase tracking-[0.16em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingId ? 'Edit Source' : 'Add Source'}
              </h2>
              {editingId ? (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(defaultFormState());
                    setStatus('Create mode restored.');
                  }}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-terminal ${
                    isDark ? 'border-white/15 text-white/70' : 'border-black/15 text-slate-700'
                  }`}
                >
                  New
                </button>
              ) : null}
            </div>

            <form onSubmit={submitForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.id}
                  onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                  placeholder="id"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                  disabled={Boolean(editingId)}
                />
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="name"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                />
              </div>

              <input
                value={form.endpoint}
                onChange={(event) => setForm((prev) => ({ ...prev, endpoint: event.target.value }))}
                placeholder="https://api.example.com/feed"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                }`}
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.kind}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, kind: event.target.value as ResearchSourceConfig['kind'] }))
                  }
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                >
                  <option value="paper">paper</option>
                  <option value="blog">blog</option>
                  <option value="mixed">mixed</option>
                </select>
                <select
                  value={form.method}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, method: event.target.value as ResearchSourceConfig['method'] }))
                  }
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.authType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      authType: event.target.value as ResearchSourceConfig['authType'],
                    }))
                  }
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                >
                  <option value="none">none</option>
                  <option value="bearer">bearer</option>
                  <option value="header">header</option>
                </select>
                <input
                  value={form.authEnvKey}
                  onChange={(event) => setForm((prev) => ({ ...prev, authEnvKey: event.target.value }))}
                  placeholder="auth env key"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  value={form.timeoutMs}
                  onChange={(event) => setForm((prev) => ({ ...prev, timeoutMs: event.target.value }))}
                  placeholder="timeout"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                />
                <input
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                  placeholder="priority"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                />
                <label
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
                  />
                  Enabled
                </label>
              </div>

              <textarea
                value={form.headersJson}
                onChange={(event) => setForm((prev) => ({ ...prev, headersJson: event.target.value }))}
                rows={3}
                placeholder="headers JSON"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                  isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                }`}
              />

              <textarea
                value={form.queryJson}
                onChange={(event) => setForm((prev) => ({ ...prev, queryJson: event.target.value }))}
                rows={3}
                placeholder="query JSON"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                  isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                }`}
              />

              <textarea
                value={form.mappingJson}
                onChange={(event) => setForm((prev) => ({ ...prev, mappingJson: event.target.value }))}
                rows={8}
                placeholder="mapping JSON"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                  isDark ? 'border-white/15 bg-white/[0.03] text-white' : 'border-black/15 bg-white text-slate-900'
                }`}
              />

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] font-terminal transition ${
                  isDark
                    ? 'border-white/20 bg-white/[0.04] text-white/85 hover:border-white/35'
                    : 'border-black/20 bg-white text-slate-800 hover:border-black/35'
                } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {editingId ? <Save size={12} /> : <Plus size={12} />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
