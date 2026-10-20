'use client';

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react';
import { exactRotation, integrateRotation, positionError, type Point } from '@/lib/integration';
import styles from './paper.module.css';

const subscribe = () => () => {};
const ready = () => true;
const notReady = () => false;
const TURN = 2 * Math.PI;

export default function RotationExperiment() {
  const id = useId();
  const enhanced = useSyncExternalStore(subscribe, ready, notReady);
  const [steps, setSteps] = useState(32);
  const [step, setStep] = useState(32);
  const [playing, setPlaying] = useState(false);
  const [showEuler, setShowEuler] = useState(true);
  const [showMidpoint, setShowMidpoint] = useState(true);
  const paths = useMemo(
    () => ({
      euler: integrateRotation(steps, 'euler'),
      midpoint: integrateRotation(steps, 'midpoint'),
    }),
    [steps],
  );
  const scale = 165 / Math.max(1.25, ...paths.euler.map((p) => Math.hypot(p.x, p.y)));
  const x = (p: Point) => 300 + scale * p.x;
  const y = (p: Point) => 200 - scale * p.y;
  const path = (points: Point[]) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${x(p).toFixed(3)},${y(p).toFixed(3)}`).join(' ');
  const time = (step * TURN) / steps;
  const exact = exactRotation(time);
  const euler = paths.euler[step];
  const midpoint = paths.midpoint[step];

  useEffect(() => {
    if (!playing) return;
    let next = step;
    const timer = window.setInterval(() => {
      next += 1;
      setStep(Math.min(next, steps));
      if (next >= steps) {
        window.clearInterval(timer);
        setPlaying(false);
      }
    }, 70);
    return () => window.clearInterval(timer);
  }, [playing, steps, step]);

  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);

  function changeSteps(value: number) {
    setPlaying(false);
    setSteps(value);
    setStep(value);
  }

  return (
    <figure className={styles.experiment} aria-label="Compare numerical integration methods">
      <div className={styles.plotHeader}>
        <span>One revolution · Same initial position</span>
        <span>Radius = 1</span>
      </div>
      <svg
        viewBox="0 0 600 400"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <title id={`${id}-title`}>Euler and midpoint compared with an exact circle</title>
        <desc id={`${id}-description`}>
          After {step} of {steps} steps, Euler position error is{' '}
          {positionError(euler, time).toFixed(4)} and midpoint position error is{' '}
          {positionError(midpoint, time).toFixed(4)}. The solid square marks Euler; the hollow
          circle marks midpoint. Both share the same scale.
        </desc>
        <path d="M40 200 H560 M300 24 V376" className={styles.axis} />
        <circle cx="300" cy="200" r={scale} className={styles.referenceCircle} />
        <circle cx="300" cy="200" r={scale / 2} className={styles.construction} />
        <text x="553" y="218" className={styles.svgLabel}>
          x
        </text>
        <text x="310" y="31" className={styles.svgLabel}>
          y
        </text>
        <text x="309" y="218" className={styles.svgLabel}>
          0
        </text>
        <text x={300 + scale} y="218" className={styles.svgLabel}>
          1
        </text>
        {showEuler && (
          <path
            data-testid="euler-path"
            d={path(paths.euler.slice(0, step + 1))}
            className={styles.eulerLine}
          />
        )}
        {showMidpoint && (
          <path
            data-testid="midpoint-path"
            d={path(paths.midpoint.slice(0, step + 1))}
            className={styles.midpointLine}
          />
        )}
        {showEuler && (
          <path
            d={`M${x(euler)} ${y(euler)} L${x(exact)} ${y(exact)}`}
            className={styles.errorLine}
          />
        )}
        <circle cx={x(exact)} cy={y(exact)} r="4" className={styles.dot} />
        {showEuler && (
          <rect
            x={x(euler) - 4}
            y={y(euler) - 4}
            width="8"
            height="8"
            className={styles.eulerDot}
          />
        )}
        {showMidpoint && (
          <circle cx={x(midpoint)} cy={y(midpoint)} r="5" className={styles.midpointDot} />
        )}
      </svg>
      <div className={styles.legend}>
        <span>
          <i className={styles.exactKey} />
          Exact circle
        </span>
        <span>
          <i className={styles.eulerKey} />
          Euler
        </span>
        <span>
          <i className={styles.midpointKey} />
          Midpoint
        </span>
      </div>
      <fieldset disabled={!enhanced} className={styles.controls}>
        <legend className={styles.srOnly}>Experiment controls</legend>
        <div className={styles.controlRow}>
          <label htmlFor={`${id}-steps`}>
            Steps per revolution <output aria-live="off">{steps}</output>
          </label>
          <input
            id={`${id}-steps`}
            aria-label="Steps per revolution"
            aria-valuetext={`${steps} steps, time interval ${(TURN / steps).toFixed(4)}`}
            type="range"
            min="16"
            max="128"
            step="8"
            value={steps}
            onChange={(event) => changeSteps(Number(event.target.value))}
          />
          <div className={styles.rangeEnds}>
            <span>Fewer, larger steps</span>
            <span>More, smaller steps</span>
          </div>
        </div>
        <div className={styles.controlRow}>
          <label htmlFor={`${id}-time`}>
            Position in the turn{' '}
            <output aria-live="off">
              {step} / {steps}
            </output>
          </label>
          <input
            id={`${id}-time`}
            aria-label="Position in the turn"
            aria-valuetext={`${step} of ${steps} steps`}
            type="range"
            min="0"
            max={steps}
            step="1"
            value={step}
            onChange={(event) => {
              setPlaying(false);
              setStep(Number(event.target.value));
            }}
          />
        </div>
        <div className={styles.toolbar}>
          <button
            type="button"
            onClick={() => {
              if (step >= steps) setStep(0);
              setPlaying(!playing);
            }}
          >
            {playing ? 'Pause' : step === steps ? 'Replay turn' : 'Play turn'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
          >
            Reset turn
          </button>
          <div className={styles.toggles}>
            <label>
              <input
                type="checkbox"
                checked={showEuler}
                onChange={(event) => setShowEuler(event.target.checked)}
              />
              Euler
            </label>
            <label>
              <input
                type="checkbox"
                checked={showMidpoint}
                onChange={(event) => setShowMidpoint(event.target.checked)}
              />
              Midpoint
            </label>
          </div>
        </div>
      </fieldset>
      <div className={styles.readouts}>
        <div>
          <span>Time step, Δt</span>
          <output aria-live="off" data-testid="step-size">
            {(TURN / steps).toFixed(4)}
          </output>
        </div>
        <div>
          <span>Euler position error</span>
          <output aria-live="off" data-testid="euler-error">
            {positionError(euler, time).toFixed(4)}
          </output>
        </div>
        <div>
          <span>Midpoint position error</span>
          <output aria-live="off" data-testid="midpoint-error">
            {positionError(midpoint, time).toFixed(4)}
          </output>
        </div>
      </div>
      <figcaption>
        Move either slider to inspect the calculation. Dashed line: exact circle. Square: Euler
        estimate. Hollow circle: midpoint estimate. Error is distance from the exact position at the
        same time.
      </figcaption>
      <noscript>
        <p className={styles.noScript}>
          The diagram shows the complete 32-step calculation. Enable JavaScript to adjust the
          experiment; the explanation and comparison table work without it.
        </p>
      </noscript>
    </figure>
  );
}
