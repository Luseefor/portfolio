'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import {
  APPROACH,
  MATCH_TOLERANCE,
  matchError,
  nearTable,
  readNote,
  SAVE_KEY,
  SPAWN,
  START_FREQUENCY,
  TARGET_FREQUENCY,
  type Point,
} from '@/lib/fieldwork/game';
import type { GameBridge } from './types';
import styles from './game.module.css';

const ResearchScene = dynamic(() => import('./ResearchScene'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Preparing the research grounds…</div>,
});
const subscribe = () => () => {};
const client = () => true,
  server = () => false;
const MOVEMENT = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
]);

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (milliseconds: number) => void;
  }
}
function Profile({ frequency }: { frequency: number }) {
  const line = (w: number) =>
    Array.from(
      { length: 97 },
      (_, i) =>
        `${i ? 'L' : 'M'}${(12 + (i * 296) / 96).toFixed(2)},${(62 - Math.sin((-3 + i / 16) * w) * 40).toFixed(2)}`,
    ).join(' ');
  return (
    <svg
      viewBox="0 0 320 124"
      role="img"
      aria-label="Solid blue current wave compared with the dashed target profile"
    >
      <path d="M12 62H308 M160 12V112" stroke="currentColor" opacity=".12" />
      <path
        d={line(TARGET_FREQUENCY)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="4 4"
      />
      <path d={line(frequency)} fill="none" stroke="#527e96" strokeWidth="2.4" />
    </svg>
  );
}
function Instrument({
  frequency,
  setFrequency,
  calibrated,
  check,
  ready,
}: {
  frequency: number;
  setFrequency: (n: number) => void;
  calibrated: boolean;
  check: () => void;
  ready: boolean;
}) {
  const id = useId();
  return (
    <>
      <span className={styles.kicker}>Instrument 01 / wave table</span>
      <h2>Find the same rhythm.</h2>
      <p>
        Adjust the frequency until the solid profile matches the dashed reference. Then verify the
        match.
      </p>
      <Profile frequency={frequency} />
      <div className={styles.legend}>
        <span>━ Current</span>
        <span>┄ Reference</span>
      </div>
      <label htmlFor={id}>
        Frequency ω <output aria-live="off">{frequency.toFixed(2)}</output>
      </label>
      <input
        id={id}
        type="range"
        min="0.5"
        max="2.5"
        step="0.05"
        value={frequency}
        disabled={!ready || calibrated}
        onChange={(e) => setFrequency(Number(e.target.value))}
      />
      <div className={styles.readout}>
        <span>Profile error</span>
        <output aria-live="off" data-testid="profile-error">
          {matchError(frequency).toFixed(4)}
        </output>
      </div>
      <p className={styles.measurement}>
        Root mean square error over 49 samples at z = 0, t = 0. Match tolerance ≤{' '}
        {MATCH_TOLERANCE.toFixed(2)}.
      </p>
      <button className={styles.primary} onClick={check} disabled={!ready || calibrated}>
        {calibrated ? 'Match verified ✓' : 'Verify match →'}
      </button>
      <p className={styles.equation}>y = sin(ωx) · cos(ωz)</p>
    </>
  );
}
export default function FieldworkGame() {
  const ready = useSyncExternalStore(subscribe, client, server);
  const [frequency, setFrequency] = useState(START_FREQUENCY);
  const [calibrated, setCalibrated] = useState(false);
  const [position, setPosition] = useState<Point>(SPAWN);
  const [inspecting, setInspecting] = useState(false);
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState('Drive to the blue wave table, or select Approach table.');
  const [saved, setSaved] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const notebook = useRef<HTMLDialogElement>(null);
  const instrument = useRef<HTMLElement>(null);
  const bridge = useRef<GameBridge>({
    keys: new Set(),
    position: { ...SPAWN },
    destination: null,
    manual: false,
    metrics: { calls: 0, triangles: 0, geometries: 0, textures: 0, frames: 0 },
  });
  const near = nearTable(position);
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
    try {
      const note = readNote(localStorage.getItem(SAVE_KEY));
      if (note) {
        setFrequency(note.frequency);
        setCalibrated(note.calibrated);
        setSaved(true);
        setNotice(
          note.calibrated
            ? 'Field note restored. The wave table is calibrated.'
            : 'Saved frequency restored. Continue your experiment.',
        );
      }
    } catch {
      setNotice('Browser storage is unavailable. You can still complete this visit.');
    }
  }, []);
  useEffect(() => {
    const state = bridge.current;
    const stop = () => {
      state.keys.clear();
      state.destination = null;
      state.wake?.();
    };
    const keyup = (event: KeyboardEvent) => state.keys.delete(event.code);
    const hidden = () => {
      if (document.hidden) stop();
    };
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      stop();
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', stop);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  useEffect(() => {
    window.render_game_to_text = () =>
      JSON.stringify({
        coordinates: '+x east, +z south, y up; movement relative to the camera',
        mode: inspecting ? 'instrument' : 'explore',
        rover: bridge.current.position,
        destination: bridge.current.destination,
        instrument: {
          position: APPROACH,
          near: nearTable(bridge.current.position),
          frequency,
          error: matchError(frequency),
          tolerance: MATCH_TOLERANCE,
        },
        notebook: { completed: calibrated ? 1 : 0, available: 1, saved },
        render: bridge.current.metrics,
      });
    window.advanceTime = (ms) => bridge.current.advance?.(ms);
    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [frequency, calibrated, inspecting, saved]);
  useEffect(() => {
    if (inspecting) instrument.current?.focus({ preventScroll: true });
  }, [inspecting]);
  useEffect(() => {
    if (!inspecting) return;
    const escape = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && !notebook.current?.open) {
        event.preventDefault();
        setInspecting(false);
        stage.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [inspecting]);
  const onMove = useCallback(
    (point: Point) =>
      setPosition((previous) =>
        Math.abs(previous.x - point.x) + Math.abs(previous.z - point.z) > 0.001 ? point : previous,
      ),
    [],
  );
  const inspect = useCallback(() => {
    if (!nearTable(bridge.current.position)) return;
    bridge.current.keys.clear();
    bridge.current.destination = null;
    setInspecting(true);
    setNotice('Compare the solid wave with the dashed reference.');
  }, []);
  const blocked = useCallback(
    () => setNotice('The rover stopped at an obstacle. Choose a clear point or steer around it.'),
    [],
  );
  function approach() {
    bridge.current.keys.clear();
    bridge.current.destination = { ...APPROACH };
    bridge.current.manual = false;
    bridge.current.wake?.();
    stage.current?.focus({ preventScroll: true });
    setNotice('Driving to the wave table. Use movement keys to take over.');
  }
  function save(nextFrequency = frequency, nextCalibrated = calibrated) {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, frequency: nextFrequency, calibrated: nextCalibrated }),
      );
      setSaved(true);
      return true;
    } catch {
      setSaved(false);
      return false;
    }
  }
  function check() {
    if (matchError(frequency) > MATCH_TOLERANCE) {
      setNotice('The profiles still differ. Adjust the frequency and verify again.');
      return;
    }
    setCalibrated(true);
    const stored = save(frequency, true);
    setNotice(
      `Wave table calibrated. Field note 01 complete.${stored ? ' Progress saved in this browser.' : ' Browser storage is unavailable; progress lasts for this visit.'}`,
    );
  }
  function replay() {
    setFrequency(START_FREQUENCY);
    setCalibrated(false);
    setInspecting(false);
    save(START_FREQUENCY, false);
    notebook.current?.close();
    setNotice('A new calibration attempt is ready. Your rover stays where you left it.');
  }
  function closeInstrument() {
    setInspecting(false);
    stage.current?.focus({ preventScroll: true });
  }
  function clearInput() {
    bridge.current.keys.clear();
    bridge.current.destination = null;
  }
  return (
    <main id="content" className={styles.game} tabIndex={-1}>
      <div
        className={styles.world}
        ref={stage}
        role="group"
        aria-label="Research grounds. WASD or arrow keys to drive, E to inspect, F for fullscreen."
        tabIndex={0}
        onBlur={(event) => {
          bridge.current.keys.clear();
          if (!event.currentTarget.contains(event.relatedTarget)) bridge.current.destination = null;
        }}
        onPointerDown={(event) => {
          if (event.target instanceof HTMLCanvasElement)
            stage.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.code === 'Escape' && inspecting) {
            event.preventDefault();
            closeInstrument();
            return;
          }
          if (event.target !== event.currentTarget) return;
          if (MOVEMENT.has(event.code)) {
            event.preventDefault();
            bridge.current.keys.add(event.code);
            bridge.current.manual = false;
            bridge.current.wake?.();
          }
          if (event.code === 'KeyE') {
            event.preventDefault();
            inspect();
          }
          if (event.code === 'KeyF') {
            event.preventDefault();
            const attempt = document.fullscreenElement
              ? document.exitFullscreen()
              : stage.current?.requestFullscreen();
            attempt?.catch(() =>
              setNotice('Fullscreen is unavailable. You can continue in this view.'),
            );
          }
        }}
      >
        {ready ? (
          <ResearchScene
            bridge={bridge}
            frequency={frequency}
            calibrated={calibrated}
            dark={dark}
            onMove={onMove}
            onInspect={inspect}
            onBlocked={blocked}
          />
        ) : (
          <div className={styles.loading}>
            The 3D research grounds load with JavaScript. Read the experiment and reference profile
            below.
          </div>
        )}
        <header className={styles.hudTop}>
          <div className={styles.brand}>
            <h1>Fieldwork</h1>
            <span>
              Research
              <br />
              grounds
            </span>
          </div>
          <button
            className={styles.notebookButton}
            onClick={() => {
              clearInput();
              notebook.current?.showModal();
            }}
            disabled={!ready}
          >
            Field notes <span>{calibrated ? '1' : '0'}/1</span>
          </button>
        </header>
        <div className={styles.hudBottom}>
          <div className={styles.objective}>
            <span className={styles.kicker}>Study 01 / waves</span>
            <h2>
              {calibrated
                ? 'A match, recorded.'
                : near
                  ? 'The wave table is within reach.'
                  : 'Calibrate the wave table.'}
            </h2>
            <p>
              {calibrated
                ? 'Continue exploring, or replay the experiment.'
                : near
                  ? 'Inspect the instrument to compare two wave profiles.'
                  : 'Drive to the blue instrument and find its matching frequency.'}
            </p>
            <div className={styles.actions}>
              {!near && (
                <button id="approach-table" onClick={approach} disabled={!ready}>
                  Approach table ↗
                </button>
              )}
              <button id="inspect-table" onClick={inspect} disabled={!ready || !near}>
                E / Inspect table
              </button>
            </div>
          </div>
          <div className={styles.worldTools}>
            <details>
              <summary>Controls</summary>
              <p>
                WASD or arrows to drive. Click clear ground to move there. Drag to orbit; scroll or
                pinch to zoom. E inspects a nearby table. F toggles fullscreen; Esc exits it.
              </p>
            </details>
            <button onClick={() => bridge.current.resetView?.()} disabled={!ready}>
              Reset view
            </button>
          </div>
        </div>
        {inspecting && (
          <section
            ref={instrument}
            className={styles.instrument}
            aria-label="Wave-table instrument"
            tabIndex={-1}
          >
            <button
              className={styles.close}
              onClick={closeInstrument}
              aria-label="Close instrument"
            >
              ×
            </button>
            <Instrument
              frequency={frequency}
              setFrequency={(n) => {
                setFrequency(n);
                setSaved(false);
              }}
              calibrated={calibrated}
              check={check}
              ready={ready}
            />
            {calibrated && (
              <button className={styles.replay} onClick={replay}>
                Replay challenge
              </button>
            )}
            <button className={styles.resume} onClick={closeInstrument}>
              Resume exploring ↗
            </button>
          </section>
        )}
      </div>
      <div className={styles.belowWorld}>
        <p role="status" className={styles.notice}>
          {notice}
        </p>
        <div className={styles.movement} aria-label="Touch driving controls">
          {(['KeyW', 'KeyA', 'KeyS', 'KeyD'] as const).map((key, i) => (
            <button
              key={key}
              disabled={!ready}
              aria-label={['Drive forward', 'Drive left', 'Drive backward', 'Drive right'][i]}
              onPointerDown={(event) => {
                event.preventDefault();
                clearInput();
                bridge.current.manual = false;
                event.currentTarget.setPointerCapture(event.pointerId);
                bridge.current.keys.add(key);
                bridge.current.wake?.();
              }}
              onPointerUp={() => bridge.current.keys.delete(key)}
              onPointerCancel={() => bridge.current.keys.delete(key)}
              onLostPointerCapture={() => bridge.current.keys.delete(key)}
              onClick={(event) => {
                if (event.detail === 0) {
                  bridge.current.manual = false;
                  bridge.current.keys.add(key);
                  bridge.current.wake?.();
                  window.setTimeout(() => bridge.current.keys.delete(key), 200);
                }
              }}
            >
              {['↑', '←', '↓', '→'][i]}
            </button>
          ))}
        </div>
        <div className={styles.footer}>
          <span data-testid="game-rover-position">
            Rover / x {position.x.toFixed(1)} · z {position.z.toFixed(1)}
          </span>
          <Link href="/interactive/sandbox" prefetch={false}>
            Open mathematical sandbox ↗
          </Link>
        </div>
        <details className={styles.accessible}>
          <summary>Accessible experiment controls</summary>
          <p>
            Complete the same calibration without driving or using WebGL. The equation and profile
            remain readable without JavaScript.
          </p>
          <Instrument
            frequency={frequency}
            setFrequency={(n) => {
              setFrequency(n);
              setSaved(false);
            }}
            calibrated={calibrated}
            check={check}
            ready={ready}
          />
          {calibrated && (
            <button className={styles.replay} onClick={replay}>
              Replay challenge
            </button>
          )}
        </details>
        <noscript>
          <p>
            Enable JavaScript to drive and verify matches. Open the accessible experiment controls
            above to read the initial equation and reference profile.
          </p>
        </noscript>
      </div>
      <dialog ref={notebook} className={styles.notebook} aria-labelledby="notebook-title">
        <button
          className={styles.close}
          onClick={() => notebook.current?.close()}
          aria-label="Close field notes"
        >
          ×
        </button>
        <span className={styles.kicker}>Field notebook / study 01</span>
        <h2 id="notebook-title">
          {calibrated ? 'Wave table calibrated.' : 'An unfinished observation.'}
        </h2>
        <p>
          {calibrated
            ? 'You matched the reference profile within the stated tolerance.'
            : 'Find the reference frequency by comparing the two profiles at the wave table.'}
        </p>
        {calibrated && (
          <dl>
            <div>
              <dt>Verified frequency</dt>
              <dd>{frequency.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Profile RMS error</dt>
              <dd>{matchError(frequency).toFixed(4)}</dd>
            </div>
          </dl>
        )}
        <p>{saved ? 'Saved in this browser.' : 'Progress has not been saved.'}</p>
        <button
          className={styles.primary}
          onClick={() =>
            setNotice(
              save() ? 'Field notes saved in this browser.' : 'Browser storage is unavailable.',
            )
          }
        >
          Save field notes
        </button>
        {calibrated && (
          <button className={styles.replay} onClick={replay}>
            Replay challenge
          </button>
        )}
      </dialog>
    </main>
  );
}
