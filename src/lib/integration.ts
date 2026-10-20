export type Point = { x: number; y: number };

export type IntegrationMethod = 'euler' | 'midpoint';

const MIN_STEPS = 4;
const MAX_STEPS = 256;

function isMethod(method: unknown): method is IntegrationMethod {
  return method === 'euler' || method === 'midpoint';
}

function assertPoint(point: Point): void {
  if (
    point === null ||
    point === undefined ||
    typeof point.x !== 'number' ||
    typeof point.y !== 'number' ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y)
  ) {
    throw new RangeError('point must hold finite x and y numbers');
  }
}

function assertStepSize(h: number): void {
  if (typeof h !== 'number' || !Number.isFinite(h) || h <= 0) {
    throw new RangeError('h must be a finite number above 0');
  }
}

function assertSteps(steps: number): void {
  if (
    typeof steps !== 'number' ||
    !Number.isInteger(steps) ||
    steps < MIN_STEPS ||
    steps > MAX_STEPS
  ) {
    throw new RangeError(`steps must be an integer from ${MIN_STEPS} to ${MAX_STEPS}`);
  }
}

function assertMethod(method: IntegrationMethod): void {
  if (!isMethod(method)) {
    throw new RangeError('method must be "euler" or "midpoint"');
  }
}

function assertTime(t: number): void {
  if (typeof t !== 'number' || !Number.isFinite(t)) {
    throw new RangeError('t must be a finite number');
  }
}

// Exact motion for x' = -y, y' = x from (1, 0): a unit circle.
export function exactRotation(t: number): Point {
  assertTime(t);
  return { x: Math.cos(t), y: Math.sin(t) };
}

export function positionError(point: Point, t: number): number {
  assertPoint(point);
  assertTime(t);
  const exact = exactRotation(t);
  return Math.hypot(point.x - exact.x, point.y - exact.y);
}

// One explicit step of the rotation field f(x, y) = (-y, x).
// Midpoint here is the explicit RK2 step through the half point,
// not an implicit energy-conserving solve, so it still drifts.
export function nextRotationStep(point: Point, h: number, method: IntegrationMethod): Point {
  assertPoint(point);
  assertStepSize(h);
  assertMethod(method);

  if (method === 'euler') {
    return {
      x: point.x - h * point.y,
      y: point.y + h * point.x,
    };
  }

  const halfX = point.x - (h / 2) * point.y;
  const halfY = point.y + (h / 2) * point.x;
  return {
    x: point.x - h * halfY,
    y: point.y + h * halfX,
  };
}

// March t = 0 to 2*PI from (1, 0) with fixed h = 2*PI / steps.
// Returns the start point plus one entry per step.
export function integrateRotation(steps: number, method: IntegrationMethod): Point[] {
  assertSteps(steps);
  assertMethod(method);

  const h = (2 * Math.PI) / steps;
  const path: Point[] = [{ x: 1, y: 0 }];
  for (let i = 0; i < steps; i += 1) {
    path.push(nextRotationStep(path[i], h, method));
  }
  return path;
}
