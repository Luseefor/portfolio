type Vec2 = { x: number; y: number };

export function clampVector(x: number, y: number, radius: number): Vec2 {
  const length = Math.hypot(x, y);
  if (length <= radius || length <= 1e-5) return { x, y };
  const scale = radius / length;
  return { x: x * scale, y: y * scale };
}

export function applyDeadzone(value: number, deadzone: number) {
  if (Math.abs(value) <= deadzone) return 0;
  const sign = Math.sign(value);
  const magnitude = (Math.abs(value) - deadzone) / (1 - deadzone);
  return sign * Math.min(1, Math.max(0, magnitude));
}

export function resolvePointerId(pointerId: number) {
  return Number.isFinite(pointerId) ? pointerId : 1;
}
