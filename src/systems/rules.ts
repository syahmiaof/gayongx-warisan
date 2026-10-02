export type AttackKind = 'light' | 'heavy' | 'finisher';
export type EnemyState = 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' | 'BLOCK' | 'HIT' | 'DEFEATED';
export const ATTACKS = {
  light: { damage: 18, reach: 100, windup: 85, active: 110, recovery: 160 },
  heavy: { damage: 36, reach: 120, windup: 260, active: 140, recovery: 290 },
  finisher: { damage: 150, reach: 106, windup: 180, active: 160, recovery: 420 },
} as const;
export const PARRY_WINDOW = 190;
export const DODGE_IFRAMES = 310;
export function inReach(
  ax: number,
  ay: number,
  facing: number,
  bx: number,
  by: number,
  reach: number,
): boolean {
  return Math.abs(bx - ax) <= reach && Math.abs(by - ay) < 78 && (bx - ax) * facing >= -18;
}
export function defend(opts: {
  dodging: boolean;
  blocking: boolean;
  facingAttack: boolean;
  sinceBlock: number;
  heavy?: boolean;
}): 'dodge' | 'parry' | 'block' | 'hit' {
  if (opts.dodging) return 'dodge';
  if (opts.blocking && opts.facingAttack) {
    if (opts.sinceBlock <= PARRY_WINDOW) return 'parry';
    if (!opts.heavy) return 'block';
  }
  return 'hit';
}
export function nextCombo(previous: number, elapsed: number): number {
  return elapsed < 900 ? (previous % 3) + 1 : 1;
}
export function canFinish(health: number, max: number): boolean {
  return health > 0 && health <= max * 0.3;
}
