'use client';
import { useId, type Dispatch, type SetStateAction } from 'react';
import { LANDMARKS, pendulumPeriod, descentStep, type LandmarkId } from '@/lib/fieldwork/world';
import type { StudyValues } from './WorldScenery';
import styles from './game.module.css';
export default function StudyInstrument({
  study,
  values,
  setValues,
  ready,
}: {
  ready: boolean;
  study: Exclude<LandmarkId, 'wave'>;
  values: StudyValues;
  setValues: Dispatch<SetStateAction<StudyValues>>;
}) {
  const id = useId();
  return (
    <>
      <span className={styles.kicker}>Research instrument / {study}</span>
      <h2>{LANDMARKS.find((l) => l.id === study)!.name}</h2>
      {study === 'motion' && (
        <>
          <p>
            Change the center pendulum&apos;s length and step through its swing. The neighboring
            pendulums keep their own periods.
          </p>
          <label htmlFor={id}>
            Length <output>{values.length.toFixed(1)} m</output>
          </label>
          <input
            disabled={!ready}
            id={id}
            type="range"
            min="1"
            max="5"
            step=".1"
            value={values.length}
            onChange={(e) => setValues((v) => ({ ...v, length: Number(e.target.value), time: 0 }))}
          />
          <div className={styles.readout}>
            <span>Ideal period</span>
            <output data-testid="pendulum-period">
              {pendulumPeriod(values.length).toFixed(3)} s
            </output>
          </div>
          <p className={styles.equation}>T = 2π√(L / g), g = 9.81 m/s²</p>
          <p>Illustrative small-angle model. Time {values.time.toFixed(2)} s.</p>
          <button
            disabled={!ready}
            className={styles.primary}
            onClick={() => setValues((v) => ({ ...v, time: v.time + 0.25 }))}
          >
            Advance swing 0.25 s
          </button>
          <button
            disabled={!ready}
            className={styles.replay}
            onClick={() => setValues((v) => ({ ...v, length: 3.5, time: 0 }))}
          >
            Reset pendulum
          </button>
        </>
      )}
      {study === 'optimization' && (
        <>
          <p>
            The copper ball follows gradient descent on the bowl. Each step uses a fixed learning
            rate of 0.15.
          </p>
          <div className={styles.readout}>
            <span>Objective f(x, z)</span>
            <output data-testid="descent-value">
              {(values.descent.x ** 2 + values.descent.z ** 2).toFixed(4)}
            </output>
          </div>
          <p className={styles.equation}>
            f(x, z) = x² + z²
            <br />
            next = current − 0.15 ∇f
          </p>
          <button
            disabled={!ready}
            className={styles.primary}
            onClick={() => setValues((v) => ({ ...v, descent: descentStep(v.descent) }))}
          >
            Take descent step
          </button>
          <button
            disabled={!ready}
            className={styles.replay}
            onClick={() => setValues((v) => ({ ...v, descent: { x: 3, z: 2 } }))}
          >
            Reset descent
          </button>
        </>
      )}
      {study === 'signal' && (
        <>
          <p>
            Add odd harmonics and watch the grove change shape. The bars sample a truncated Fourier
            series.
          </p>
          <label htmlFor={id}>
            Odd harmonics <output>{values.harmonics}</output>
          </label>
          <input
            disabled={!ready}
            id={id}
            type="range"
            min="1"
            max="5"
            step="1"
            value={values.harmonics}
            onChange={(e) => setValues((v) => ({ ...v, harmonics: Number(e.target.value) }))}
          />
          <p className={styles.equation}>Σ sin(kx) / k, k = 1, 3, …, {values.harmonics * 2 - 1}</p>
          <button
            disabled={!ready}
            className={styles.replay}
            onClick={() => setValues((v) => ({ ...v, harmonics: 1 }))}
          >
            Reset signal
          </button>
        </>
      )}
      {study === 'topology' && (
        <>
          <p>
            A curve wraps around a torus in two directions. Choose coprime winding counts to draw
            one continuous knot.
          </p>
          <label htmlFor={id}>Torus knot</label>
          <select
            disabled={!ready}
            id={id}
            value={values.knot}
            onChange={(e) => setValues((v) => ({ ...v, knot: Number(e.target.value) }))}
          >
            <option value="0">Trefoil, (2, 3)</option>
            <option value="1">Cinquefoil, (2, 5)</option>
            <option value="2">Torus knot, (3, 4)</option>
          </select>
          <button
            disabled={!ready}
            className={styles.replay}
            onClick={() => setValues((v) => ({ ...v, knot: 0 }))}
          >
            Reset knot
          </button>
        </>
      )}
    </>
  );
}
