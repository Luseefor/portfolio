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
import { usePortfolioMode } from '@/components/portfolio/PortfolioShell';
import {
  LANDMARKS,
  nearestLandmark,
  surveyCell,
  CELL_SIZE,
  type LandmarkId,
} from '@/lib/fieldwork/world';
import type { StudyValues } from './WorldScenery';
import StudyInstrument from './StudyInstrument';

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
  const { mode, toggleMode } = usePortfolioMode();
  const dark = mode === 'dark';
  const [study, setStudy] = useState<Exclude<LandmarkId, 'wave'> | null>(null);
  const [values, setValues] = useState<StudyValues>({
    length: 3.5,
    time: 0,
    descent: { x: 3, z: 2 },
    harmonics: 1,
    knot: 0,
  });
  const [touchDriving, setTouchDriving] = useState(false);
  const guide = useRef<HTMLDetailsElement>(null);
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
        mode: inspecting || study ? 'instrument' : 'explore',
        study,
        survey: {
          cell: {
            x: Math.floor(bridge.current.position.x / CELL_SIZE),
            z: Math.floor(bridge.current.position.z / CELL_SIZE),
          },
          props: surveyCell(
            Math.floor(bridge.current.position.x / CELL_SIZE),
            Math.floor(bridge.current.position.z / CELL_SIZE),
          ),
        },
        experiments: values,
        landmarks: LANDMARKS.map((l) => ({
          id: l.id,
          position: l.approach,
          near:
            Math.hypot(
              l.approach.x - bridge.current.position.x,
              l.approach.z - bridge.current.position.z,
            ) < 5.5,
        })),
        rover: bridge.current.position,
        destination: bridge.current.destination,
        camera: bridge.current.view,
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
  }, [frequency, calibrated, inspecting, saved, study, values]);
  useEffect(() => {
    if (inspecting) instrument.current?.focus({ preventScroll: true });
  }, [inspecting]);
  useEffect(() => {
    if (study) instrument.current?.focus({ preventScroll: true });
  }, [study]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.code !== 'Escape' || notebook.current?.open) return;
      event.preventDefault();
      if (inspecting || study) {
        setInspecting(false);
        setStudy(null);
        stage.current?.focus({ preventScroll: true });
      } else if (guide.current?.open) {
        guide.current.open = false;
        stage.current?.focus({ preventScroll: true });
      } else {
        bridge.current.keys.clear();
        bridge.current.destination = null;
        if (guide.current) {
          guide.current.open = true;
          guide.current.querySelector('summary')?.focus();
        }
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [inspecting, study]);
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
    if (guide.current) guide.current.open = false;
    stage.current?.focus({ preventScroll: true });
    setNotice('Driving to the wave table. Use movement keys to take over.');
  }
  function returnToLab() {
    clearInput();
    bridge.current.manual = false;
    bridge.current.position = { ...SPAWN };
    setPosition({ ...SPAWN });
    bridge.current.resetView?.();
    stage.current?.focus({ preventScroll: true });
    setNotice('Returned to the wave-table station. Your field notes are unchanged.');
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
    setStudy(null);
    stage.current?.focus({ preventScroll: true });
  }
  function clearInput() {
    bridge.current.keys.clear();
    bridge.current.destination = null;
  }
  function openGuide() {
    clearInput();
    if (guide.current) {
      guide.current.open = true;
      guide.current.querySelector('summary')?.focus();
    }
  }
  function selectLandmark(id: LandmarkId) {
    const landmark = LANDMARKS.find((l) => l.id === id)!;
    if (
      Math.hypot(
        bridge.current.position.x - landmark.approach.x,
        bridge.current.position.z - landmark.approach.z,
      ) >= 5.5
    ) {
      clearInput();
      bridge.current.destination = { ...landmark.approach };
      bridge.current.manual = false;
      bridge.current.wake?.();
      stage.current?.focus({ preventScroll: true });
      setNotice(`Driving to ${landmark.name}.`);
      return;
    }
    clearInput();
    if (id === 'wave') inspect();
    else {
      setInspecting(false);
      setStudy(id);
    }
  }
  function jumpTo(id: LandmarkId) {
    const landmark = LANDMARKS.find((l) => l.id === id)!;
    clearInput();
    bridge.current.position = { ...landmark.approach };
    setPosition({ ...landmark.approach });
    bridge.current.manual = false;
    bridge.current.resetView?.();
    if (guide.current) guide.current.open = false;
    stage.current?.focus({ preventScroll: true });
  }
  const nearby = nearestLandmark(position);
  return (
    <main id="content" className={styles.game} tabIndex={-1} data-ready={ready}>
      <h1 className={styles.srOnly}>Fieldwork</h1>
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
          if (event.target !== event.currentTarget) return;
          if (MOVEMENT.has(event.code)) {
            event.preventDefault();
            bridge.current.keys.add(event.code);
            bridge.current.manual = false;
            bridge.current.wake?.();
          }
          if (event.code === 'KeyE') {
            event.preventDefault();
            const landmark = nearestLandmark(bridge.current.position);
            if (landmark) selectLandmark(landmark.id);
          }
          if (event.code === 'KeyF') {
            event.preventDefault();
            const attempt = document.fullscreenElement
              ? document.exitFullscreen()
              : stage.current?.closest<HTMLElement>('[data-portfolio-theme]')?.requestFullscreen();
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
            values={values}
            onSelect={selectLandmark}
            onGuide={openGuide}
          />
        ) : (
          <div className={styles.loading}>
            The playground needs JavaScript. Open the field guide for equations and accessible
            controls.
          </div>
        )}
        {nearby && !inspecting && !study && (
          <button
            className={styles.proximity}
            id="inspect-table"
            onClick={() => selectLandmark(nearby.id)}
          >
            E / {nearby.id === 'wave' ? 'Inspect table' : nearby.name}
          </button>
        )}
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
            <p className={styles.feedback}>{notice}</p>
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
        {study && (
          <section
            ref={instrument}
            className={styles.instrument}
            aria-label={`${LANDMARKS.find((l) => l.id === study)!.name} instrument`}
            tabIndex={-1}
          >
            <button
              className={styles.close}
              onClick={closeInstrument}
              aria-label="Close instrument"
            >
              ×
            </button>
            <StudyInstrument study={study} values={values} setValues={setValues} ready={ready} />
            <button className={styles.resume} onClick={closeInstrument}>
              Resume exploring ↗
            </button>
          </section>
        )}
      </div>
      <p role="status" className={styles.srOnly}>
        {notice}
      </p>
      {touchDriving && (
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
      )}
      <details
        ref={guide}
        data-testid="field-guide"
        className={styles.guide}
        onToggle={(event) => {
          if (event.currentTarget.open) clearInput();
        }}
      >
        <summary aria-label="Field guide">
          Field guide <span aria-hidden="true">×</span>
        </summary>
        <div className={styles.guideBody}>
          <p>
            WASD or arrows to drive. Click clear ground to travel. Drag to orbit; scroll or pinch to
            zoom. Click a sculpture to approach, then press E to explore. Escape opens this guide. F
            toggles fullscreen.
          </p>
          <div className={styles.guideActions}>
            <button id="approach-table" onClick={approach} disabled={!ready}>
              Approach table ↗
            </button>
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
            <button
              onClick={() => {
                bridge.current.resetView?.();
                if (guide.current) guide.current.open = false;
                stage.current?.focus({ preventScroll: true });
              }}
              disabled={!ready}
            >
              Reset view
            </button>
            <button
              onClick={() => {
                returnToLab();
                if (guide.current) guide.current.open = false;
              }}
              disabled={!ready}
            >
              Return to lab
            </button>
            <button
              onClick={toggleMode}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? 'Switch to light mode' : 'Switch to dark mode'}
            </button>
          </div>
          <label className={styles.touchOption}>
            <input
              type="checkbox"
              checked={touchDriving}
              onChange={(e) => setTouchDriving(e.target.checked)}
            />
            Touch driving buttons
          </label>
          <h2>Research grounds</h2>
          <div className={styles.destinations}>
            {LANDMARKS.map((l) => (
              <button key={l.id} onClick={() => jumpTo(l.id)} disabled={!ready}>
                Jump to {l.name} ↗
              </button>
            ))}
          </div>
          <p className={styles.coordinates} data-testid="game-rover-position">
            Rover / x {position.x.toFixed(1)} · z {position.z.toFixed(1)}
          </p>
          <Link href="/interactive/sandbox" prefetch={false}>
            Open mathematical sandbox ↗
          </Link>
          <details className={styles.accessible}>
            <summary>Accessible experiment controls</summary>
            <p>
              Complete the calibration without driving or WebGL. The equation and profile remain
              readable without JavaScript.
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
            <p className={styles.feedback}>{notice}</p>
            {calibrated && (
              <button className={styles.replay} onClick={replay}>
                Replay challenge
              </button>
            )}
            {LANDMARKS.filter((l) => l.id !== 'wave').map((l) => (
              <details key={l.id} className={styles.accessible}>
                <summary>{l.name}</summary>
                <StudyInstrument
                  study={l.id as Exclude<LandmarkId, 'wave'>}
                  values={values}
                  setValues={setValues}
                  ready={ready}
                />
              </details>
            ))}
          </details>
          <noscript>
            <p>
              Enable JavaScript to drive and verify matches. Open the accessible experiment controls
              to read the equations.
            </p>
          </noscript>
        </div>
      </details>
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
