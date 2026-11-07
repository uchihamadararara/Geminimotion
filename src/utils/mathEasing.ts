import { EasingType } from '../types/motion';

export function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function solveEasing(type: EasingType, tRaw: number): number {
  const t = clamp(tRaw, 0, 1);
  switch (type) {
    case 'bezier-smooth': {
      // Apple / After Effects smooth cubic-bezier(0.16, 1, 0.3, 1) approximation
      return 1 - Math.pow(1 - t, 3.4);
    }
    case 'spring-snappy': {
      // Underdamped spring physics solver: stiffness 300, damping 22
      if (t === 0 || t === 1) return t;
      const omega = 11.5;
      const zeta = 0.62;
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      return (
        1 -
        Math.exp(-zeta * omega * t) *
          (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
      );
    }
    case 'expo-out': {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    case 'elastic-bounce': {
      if (t === 0 || t === 1) return t;
      const c4 = (2 * Math.PI) / 3.2;
      return Math.pow(2, -9 * t) * Math.sin((t * 8.5 - 0.75) * c4) + 1;
    }
    case 'linear':
    default:
      return t;
  }
}

/**
 * Computes instantaneous velocity for directional motion-blur effects
 */
export function solveVelocity(type: EasingType, tRaw: number): number {
  const dt = 0.016;
  const p1 = solveEasing(type, clamp(tRaw - dt, 0, 1));
  const p2 = solveEasing(type, clamp(tRaw + dt, 0, 1));
  return Math.abs(p2 - p1) / (2 * dt);
}
