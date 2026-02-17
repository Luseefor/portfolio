import type { FloatingParticle, FloatingParticlesProps } from './types';

type ParticleFactoryOptions = Pick<FloatingParticlesProps, 'movementSpeed' | 'particleSize' | 'particleOpacity'>;

type UpdateOptions = Pick<FloatingParticlesProps, 'mouseInfluence' | 'mouseGravity' | 'gravityStrength'>;
type DrawOptions = Pick<FloatingParticlesProps, 'particleColor' | 'glowIntensity'>;

export function createParticle(width: number, height: number, options: ParticleFactoryOptions): FloatingParticle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * (options.movementSpeed ?? 0.4),
    vy: (Math.random() - 0.5) * (options.movementSpeed ?? 0.4),
    size: Math.random() * (options.particleSize ?? 1.5) + 1,
    opacity: 0,
    baseOpacity: options.particleOpacity ?? 0.5,
    glowMultiplier: 1,
    life: Math.random() * 0.5 + 0.5,
    maxLife: 0.002 + Math.random() * 0.005,
    id: Math.random(),
  };
}

export function initializeParticles(
  width: number,
  height: number,
  particleCount: number,
  options: ParticleFactoryOptions,
) {
  return Array.from({ length: particleCount }, () => {
    const particle = createParticle(width, height, options);
    particle.opacity = options.particleOpacity ?? 0.5;
    return particle;
  });
}

export function updateParticles(
  particles: FloatingParticle[],
  width: number,
  height: number,
  mouse: { x: number; y: number; active: boolean },
  updateOptions: UpdateOptions,
  factoryOptions: ParticleFactoryOptions,
) {
  particles.forEach((particle, index) => {
    particle.life -= particle.maxLife;
    if (particle.life <= 0) {
      particles[index] = createParticle(width, height, factoryOptions);
      return;
    }

    const targetOpacity =
      particle.life < 0.2
        ? (particle.life / 0.2) * particle.baseOpacity
        : particle.life > 0.8
          ? ((1 - particle.life) / 0.2) * particle.baseOpacity
          : particle.baseOpacity;

    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    particle.vx += (Math.random() - 0.5) * 0.01;
    particle.vy += (Math.random() - 0.5) * 0.01;

    const mouseInfluence = updateOptions.mouseInfluence ?? 200;
    if (mouse.active && distance < mouseInfluence && distance > 0) {
      const force = (mouseInfluence - distance) / mouseInfluence;
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const gravityForce = force * (((updateOptions.gravityStrength ?? 60) * 0.001));
      if (updateOptions.mouseGravity === 'attract') {
        particle.vx += normalizedDx * gravityForce * 2;
        particle.vy += normalizedDy * gravityForce * 2;
      } else if (updateOptions.mouseGravity === 'repel') {
        particle.vx -= normalizedDx * gravityForce * 2;
        particle.vy -= normalizedDy * gravityForce * 2;
      }
      particle.opacity = Math.min(1, targetOpacity + force * 0.4);
      particle.glowMultiplier = 1 + force * 2;
    } else {
      particle.opacity = Math.max(0, particle.opacity + (targetOpacity - particle.opacity) * 0.1);
      particle.glowMultiplier = Math.max(1, (particle.glowMultiplier || 1) - 0.05);
    }

    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
  });
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: FloatingParticle[],
  drawOptions: DrawOptions,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineWidth = 0.5;

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    if (p1.opacity <= 0) continue;
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= 150) continue;
      const opacity = (1 - distance / 150) * Math.min(p1.opacity, p2.opacity) * 0.5;
      if (opacity <= 0) continue;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.save();
    ctx.shadowColor = drawOptions.particleColor ?? '#FFFFFF';
    ctx.shadowBlur = (drawOptions.glowIntensity ?? 10) * (p1.glowMultiplier || 1);
    ctx.globalAlpha = p1.opacity;
    ctx.fillStyle = drawOptions.particleColor ?? '#FFFFFF';
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
