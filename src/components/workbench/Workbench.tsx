'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import {
  EQUATIONS,
  freePlacement,
  frequencySweep,
  INITIAL_SURFACES,
  KINDS,
  LABELS,
  makeSurface,
  MAX_OBJECTS,
  sampleSurface,
  validPlan,
  validSurface,
  type BuildPlan,
  type Surface,
  type SurfaceKind,
  type SweepSample,
} from '@/lib/workbench/model';
import SurfacePreview from './SurfacePreview';
import styles from './workbench.module.css';

const World = dynamic(() => import('./World'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Preparing the coordinate world…</div>,
});
const subscribe = () => () => {};
const yes = () => true;
const no = () => false;
const MOVEMENT = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);
const SAVE_KEY = 'fieldwork-world-v1';

export default function Workbench() {
  const ready = useSyncExternalStore(subscribe, yes, no);
  const [objects, setObjects] = useState<Surface[]>(INITIAL_SURFACES);
  const [selected, setSelected] = useState(INITIAL_SURFACES[0].id);
  const [playing, setPlaying] = useState(false);
  const [reset, setReset] = useState(0);
  const [focus, setFocus] = useState<{ x: number; z: number; token: number } | null>(null);
  const [notice, setNotice] = useState('Select a surface, build a new one, or explore the field.');
  const [results, setResults] = useState<SweepSample[]>([]);
  const [sweeping, setSweeping] = useState(false);
  const [message, setMessage] = useState('Create a wave surface and sweep its frequency.');
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [planTarget, setPlanTarget] = useState<string | null>(null);
  const [aiState, setAiState] = useState<'checking' | 'configured' | 'unavailable'>('checking');
  const [thinking, setThinking] = useState(false);
  const [dark, setDark] = useState(false);
  const [probe, setProbe] = useState<[number, number]>([0, 11]);
  const keys = useRef(new Set<string>());
  const timer = useRef<number | null>(null);
  const counter = useRef(3);
  const selectedObject = objects.find((object) => object.id === selected) ?? objects[0];
  const sampled = selectedObject ? sampleSurface(selectedObject) : null;

  useEffect(() => {
    const shell = document.querySelector('[data-portfolio-theme]');
    if (!shell) return;
    const sync = () => setDark(shell.getAttribute('data-portfolio-theme') === 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(shell, { attributes: true, attributeFilter: ['data-portfolio-theme'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/workbench', { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setAiState(data.configured ? 'configured' : 'unavailable'))
      .catch(() => {
        if (!controller.signal.aborted) setAiState('unavailable');
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const held = keys.current;
    const clear = () => held.clear();
    const visible = () => {
      if (document.hidden) clear();
    };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', visible);
    const keyup = (event: KeyboardEvent) => held.delete(event.code);
    window.addEventListener('keyup', keyup);
    return () => {
      clear();
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('keyup', keyup);
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  function stopSweep() {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setSweeping(false);
  }
  function choose(id: string) {
    stopSweep();
    setSelected(id);
    setResults([]);
    setPlan(null);
  }
  function nextId(kind: SurfaceKind) {
    let id: string;
    do {
      id = `${kind}-${String(counter.current++).padStart(2, '0')}`;
    } while (objects.some((object) => object.id === id));
    return id;
  }
  function add(kind: SurfaceKind) {
    if (objects.length >= MAX_OBJECTS) {
      setNotice('This field holds nine objects. Remove one before adding another.');
      return;
    }
    const slot = freePlacement(objects);
    if (slot < 0) {
      setNotice('No free object placement is available. Remove an object first.');
      return;
    }
    stopSweep();
    const next = makeSurface(kind, slot, nextId(kind));
    setObjects((current) => [...current, next]);
    setSelected(next.id);
    setResults([]);
    setNotice(`${LABELS[kind]} created. Adjust its parameters in the inspector.`);
    return next;
  }
  function change(patch: Partial<Pick<Surface, 'amplitude' | 'frequency'>>) {
    stopSweep();
    setResults([]);
    setObjects((current) =>
      current.map((object) => (object.id === selected ? { ...object, ...patch } : object)),
    );
  }
  function runSweep(surface = selectedObject) {
    if (!surface || surface.kind === 'saddle') return;
    stopSweep();
    setPlaying(false);
    setSelected(surface.id);
    setResults([]);
    setSweeping(true);
    const samples = frequencySweep(surface);
    let index = 0;
    setNotice(`Running six frequency samples for ${LABELS[surface.kind]}.`);
    timer.current = window.setInterval(() => {
      const sample = samples[index];
      setObjects((current) =>
        current.map((object) =>
          object.id === surface.id ? { ...object, frequency: sample.frequency } : object,
        ),
      );
      setResults(samples.slice(0, index + 1));
      index += 1;
      if (index === samples.length) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setSweeping(false);
        setNotice('Sweep complete. Six computed samples are ready to inspect or export.');
      }
    }, 350);
  }
  async function requestPlan(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || thinking) return;
    setThinking(true);
    setPlan(null);
    setNotice('Building a mathematical experiment plan…');
    try {
      const response = await fetch('/api/workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, selected: selectedObject ?? null }),
      });
      const payload = await response.json();
      if (!response.ok || !validPlan(payload.plan)) {
        setNotice(
          typeof payload.error === 'string'
            ? payload.error
            : 'The plan could not be created. Try a different description.',
        );
        return;
      }
      setPlanTarget(selectedObject?.id ?? null);
      setPlan(payload.plan);
      setNotice('AI plan ready. Review the actions, then run it.');
    } catch {
      setNotice('The AI request could not connect. Manual experiments are still available.');
    } finally {
      setThinking(false);
    }
  }
  function executePlan() {
    if (!plan) return;
    if (plan.operation === 'create' && objects.length >= MAX_OBJECTS) {
      setNotice('Remove an object before running this create plan.');
      return;
    }
    if (plan.operation === 'create' && freePlacement(objects) < 0) {
      setNotice('No free placement is available. Remove an object first.');
      return;
    }
    const existing = objects.find((object) => object.id === planTarget);
    if (plan.operation === 'update' && !existing) {
      setNotice('The object for this plan was removed. Create a new plan.');
      setPlan(null);
      return;
    }
    let target: Surface;
    if (plan.operation === 'update' && existing)
      target = {
        ...existing,
        kind: plan.kind,
        amplitude: plan.amplitude,
        frequency: plan.frequency,
      };
    else {
      target = {
        ...makeSurface(plan.kind, freePlacement(objects), nextId(plan.kind)),
        amplitude: plan.amplitude,
        frequency: plan.frequency,
      };
    }
    stopSweep();
    setObjects((current) =>
      plan.operation === 'update' && existing
        ? current.map((object) => (object.id === target.id ? target : object))
        : [...current, target],
    );
    setSelected(target.id);
    setResults([]);
    setPlan(null);
    setNotice(plan.summary);
    if (plan.automate) runSweep(target);
  }
  function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, objects }));
      setNotice('World saved in this browser.');
    } catch {
      setNotice('Browser storage is unavailable. Export the world as JSON instead.');
    }
  }
  function load() {
    try {
      const data: unknown = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
      if (
        !data ||
        typeof data !== 'object' ||
        !('version' in data) ||
        data.version !== 1 ||
        !('objects' in data) ||
        !Array.isArray(data.objects) ||
        data.objects.length < 1 ||
        data.objects.length > MAX_OBJECTS ||
        !data.objects.every(validSurface) ||
        new Set(data.objects.map((object) => object.id)).size !== data.objects.length
      ) {
        setNotice('No valid saved world was found in this browser.');
        return;
      }
      stopSweep();
      setObjects(data.objects);
      setSelected(data.objects[0].id);
      counter.current = 100;
      setResults([]);
      setPlan(null);
      setNotice('Saved world loaded.');
    } catch {
      setNotice('The saved world could not be read. The current field is unchanged.');
    }
  }

  return (
    <main id="content" className={styles.workbench} tabIndex={-1}>
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Open mathematical workbench</span>
          <h1>
            Fieldwork<span> /</span>
          </h1>
        </div>
        <p>
          Make a surface. Change a rule.
          <br />
          See what follows.
        </p>
      </header>
      <div className={styles.layout}>
        <section className={styles.field} aria-label="Mathematical world">
          <div className={styles.fieldTop}>
            <span>
              Field 01 <i /> Live workspace
            </span>
            <span>{objects.length.toString().padStart(2, '0')} objects</span>
          </div>
          <div
            className={styles.viewport}
            role="group"
            aria-label="Explore the mathematical world with WASD or arrow keys"
            tabIndex={0}
            onKeyDown={(event) => {
              if (MOVEMENT.has(event.code) && event.target === event.currentTarget) {
                event.preventDefault();
                keys.current.add(event.code);
              }
            }}
            onBlur={() => keys.current.clear()}
            onPointerDown={(event) => {
              if (event.target instanceof HTMLCanvasElement)
                event.currentTarget.focus({ preventScroll: true });
            }}
          >
            {ready ? (
              <World
                objects={objects}
                selected={selected}
                onSelect={choose}
                dark={dark}
                playing={playing}
                reset={reset}
                focus={focus}
                keys={keys}
                onProbe={(x: number, z: number) => setProbe([x, z])}
              />
            ) : (
              <div className={styles.loading}>
                The mathematical world loads with JavaScript. The object inspector remains readable
                below.
              </div>
            )}
            <div className={styles.worldHint}>Drag to orbit · Scroll to zoom · WASD to explore</div>
          </div>
          <div className={styles.fieldBottom}>
            <output data-testid="probe-position">
              Probe / x {probe[0].toFixed(1)} · z {probe[1].toFixed(1)}
            </output>
            <div>
              <button type="button" onClick={() => setPlaying(!playing)} disabled={!ready}>
                {playing ? 'Pause time' : 'Animate waves'}
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  keys.current.clear();
                  setReset((value) => value + 1);
                  setProbe([0, 11]);
                }}
              >
                Reset view
              </button>
            </div>
          </div>
          <div className={styles.movePad} aria-label="Touch movement controls">
            {[
              ['KeyW', 'Move forward', '↑'],
              ['KeyA', 'Move left', '←'],
              ['KeyS', 'Move backward', '↓'],
              ['KeyD', 'Move right', '→'],
            ].map(([key, label, glyph]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  keys.current.add(key);
                }}
                onClick={(event) => {
                  if (event.detail === 0) {
                    keys.current.add(key);
                    window.setTimeout(() => keys.current.delete(key), 200);
                  }
                }}
                onPointerUp={() => keys.current.delete(key)}
                onPointerCancel={() => keys.current.delete(key)}
                onLostPointerCapture={() => keys.current.delete(key)}
              >
                {glyph}
              </button>
            ))}
          </div>
          <div className={styles.objectStrip} aria-label="Objects in this world">
            {objects.map((object) => (
              <button
                key={object.id}
                type="button"
                aria-label={`Inspect ${object.id.split('-').at(-1)} ${LABELS[object.kind]} ${object.id}`}
                aria-pressed={object.id === selected}
                onClick={() => choose(object.id)}
              >
                <span>{object.id.split('-').at(-1)}</span> {LABELS[object.kind]}
              </button>
            ))}
          </div>
          <div className={styles.session}>
            <button onClick={save} disabled={!ready}>
              Save world
            </button>
            <button onClick={load} disabled={!ready}>
              Load saved
            </button>
            <button
              onClick={() =>
                download(
                  'fieldwork-world.json',
                  JSON.stringify({ version: 1, objects }, null, 2),
                  'application/json',
                )
              }
              disabled={!ready}
            >
              Export JSON ↗
            </button>
          </div>
        </section>
        <aside className={styles.inspector} aria-label="Workbench controls">
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>Build</h2>
              <span>Place an object</span>
            </div>
            <div className={styles.buildButtons}>
              {KINDS.map((kind) => (
                <button
                  key={kind}
                  aria-label={`Add ${LABELS[kind]}`}
                  disabled={!ready || objects.length >= MAX_OBJECTS}
                  onClick={() => add(kind)}
                >
                  <span aria-hidden="true">＋</span>
                  {LABELS[kind]}
                </button>
              ))}
            </div>
          </section>
          {selectedObject && (
            <section className={styles.panel} aria-label="Selected object inspector">
              <div className={styles.panelTitle}>
                <h2>{LABELS[selectedObject.kind]}</h2>
                <span>{selectedObject.id}</span>
              </div>
              <div className={styles.preview}>
                <SurfacePreview surface={selectedObject} />
              </div>
              <p className={styles.equation}>{EQUATIONS[selectedObject.kind]}</p>
              <fieldset disabled={!ready || sweeping} className={styles.parameters}>
                <legend className={styles.srOnly}>Object parameters</legend>
                <label htmlFor="amplitude">
                  Amplitude <output aria-live="off">{selectedObject.amplitude.toFixed(2)}</output>
                </label>
                <input
                  id="amplitude"
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={selectedObject.amplitude}
                  onChange={(event) => change({ amplitude: Number(event.target.value) })}
                />
                <label htmlFor="frequency">
                  Frequency <output aria-live="off">{selectedObject.frequency.toFixed(2)}</output>
                </label>
                <input
                  id="frequency"
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  disabled={selectedObject.kind === 'saddle'}
                  value={selectedObject.frequency}
                  onChange={(event) => change({ frequency: Number(event.target.value) })}
                />
              </fieldset>
              <div className={styles.stats}>
                <span>
                  Min{' '}
                  <output aria-live="off" data-testid="surface-min">
                    {sampled?.minimum.toFixed(3)}
                  </output>
                </span>
                <span>
                  Max{' '}
                  <output aria-live="off" data-testid="surface-max">
                    {sampled?.maximum.toFixed(3)}
                  </output>
                </span>
              </div>
              <p className={styles.small}>
                Sampled on a 25 × 25 grid, x and z from −3 to 3, at t = 0.
                {selectedObject.kind === 'saddle'
                  ? ' Frequency does not affect this equation.'
                  : ''}
              </p>
              <div className={styles.inspectorActions}>
                <button
                  disabled={!ready}
                  onClick={() =>
                    setFocus({ x: selectedObject.x, z: selectedObject.z, token: Date.now() })
                  }
                >
                  Frame object
                </button>
                <button
                  disabled={!ready || sweeping || selectedObject.kind === 'saddle'}
                  onClick={() => runSweep()}
                >
                  {sweeping ? 'Running sweep…' : 'Sweep frequency →'}
                </button>
                <button
                  disabled={!ready || objects.length <= 1 || sweeping}
                  onClick={() => {
                    stopSweep();
                    setObjects((current) => current.filter((object) => object.id !== selected));
                    setSelected(objects.find((object) => object.id !== selected)!.id);
                    setResults([]);
                  }}
                >
                  Remove
                </button>
              </div>
            </section>
          )}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <h2>AI operator</h2>
              <span>
                {aiState === 'configured'
                  ? 'Configured'
                  : aiState === 'checking'
                    ? 'Checking…'
                    : 'Not configured'}
              </span>
            </div>
            <p className={styles.small}>
              Describe an experiment. Review the plan, then let the workbench build and run it.
            </p>
            <form onSubmit={requestPlan}>
              <label htmlFor="experiment-prompt" className={styles.srOnly}>
                Describe a mathematical experiment
              </label>
              <textarea
                id="experiment-prompt"
                maxLength={1000}
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button className={styles.primary} disabled={!ready || thinking || !message.trim()}>
                {thinking ? 'Planning…' : 'Create a plan ↗'}
              </button>
            </form>
            {plan && (
              <div className={styles.plan}>
                <h3>Proposed actions</h3>
                <p>{plan.summary}</p>
                <ol>
                  <li>
                    {plan.operation === 'create' ? 'Place' : 'Update'} a{' '}
                    {LABELS[plan.kind].toLowerCase()}
                    {plan.operation === 'update' ? `, object ${planTarget}` : ''}.
                  </li>
                  <li>
                    Set amplitude {plan.amplitude} and frequency {plan.frequency}.
                  </li>
                  {plan.automate && <li>Run six frequency samples and record the results.</li>}
                </ol>
                <button className={styles.primary} onClick={executePlan}>
                  Run this plan →
                </button>
                <button onClick={() => setPlan(null)}>Dismiss</button>
              </div>
            )}
          </section>
        </aside>
      </div>
      <p role="status" className={styles.notice}>
        {notice}
      </p>
      {results.length > 0 && (
        <section className={styles.results} aria-labelledby="results-title">
          <div className={styles.panelTitle}>
            <h2 id="results-title">Experiment log</h2>
            <button
              disabled={sweeping}
              onClick={() =>
                download(
                  'fieldwork-sweep.csv',
                  'frequency,minimum,maximum,mean\n' +
                    results
                      .map((r) => [r.frequency, r.minimum, r.maximum, r.mean].join(','))
                      .join('\n'),
                  'text/csv',
                )
              }
            >
              Export CSV ↗
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <caption>
                Deterministic samples at time zero. The selected object remains at the last sampled
                frequency.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Frequency</th>
                  <th scope="col">Minimum</th>
                  <th scope="col">Maximum</th>
                  <th scope="col">Mean</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.frequency}>
                    <th scope="row">{row.frequency.toFixed(2)}</th>
                    <td>{row.minimum.toFixed(4)}</td>
                    <td>{row.maximum.toFixed(4)}</td>
                    <td>{row.mean.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <noscript>
        <p>
          Enable JavaScript to explore, create objects, and run experiments. The initial equations
          and sampled values above remain available without it.
        </p>
      </noscript>
    </main>
  );
}
