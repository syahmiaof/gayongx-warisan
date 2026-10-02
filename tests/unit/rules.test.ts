import { describe, it, expect } from 'vitest';
import {
  inReach,
  defend,
  nextCombo,
  canFinish,
  PARRY_WINDOW,
  ATTACKS,
} from '../../src/systems/rules';
describe('Combat contract', () => {
  it('hits only enemies in front and in vertical reach', () => {
    expect(inReach(0, 566, 1, 80, 566, 100)).toBe(true);
    expect(inReach(0, 566, 1, -80, 566, 100)).toBe(false);
    expect(inReach(0, 566, -1, -80, 566, 100)).toBe(true);
    expect(inReach(0, 400, 1, 80, 566, 100)).toBe(false);
    expect(inReach(0, 566, 1, 101, 566, 100)).toBe(false);
  });
  it('parry window ends exactly after 190 ms', () => {
    const d = { dodging: false, blocking: true, facingAttack: true };
    expect(defend({ ...d, sinceBlock: PARRY_WINDOW })).toBe('parry');
    expect(defend({ ...d, sinceBlock: PARRY_WINDOW + 1 })).toBe('block');
  });
  it('dodge wins over attacks while guard fails from behind', () => {
    expect(defend({ dodging: true, blocking: false, facingAttack: false, sinceBlock: 999 })).toBe(
      'dodge',
    );
    expect(defend({ dodging: false, blocking: true, facingAttack: false, sinceBlock: 0 })).toBe(
      'hit',
    );
  });
  it('heavy breaks held guard, but a timely parry survives', () => {
    const d = { dodging: false, blocking: true, facingAttack: true, heavy: true };
    expect(defend({ ...d, sinceBlock: 500 })).toBe('hit');
    expect(defend({ ...d, sinceBlock: 100 })).toBe('parry');
  });
  it('three-hit combo cycles and expires', () => {
    expect(nextCombo(1, 350)).toBe(2);
    expect(nextCombo(2, 350)).toBe(3);
    expect(nextCombo(3, 350)).toBe(1);
    expect(nextCombo(2, 900)).toBe(1);
  });
  it('finisher requires living, low-health enemies', () => {
    expect(canFinish(30, 100)).toBe(true);
    expect(canFinish(31, 100)).toBe(false);
    expect(canFinish(0, 100)).toBe(false);
    expect(canFinish(-5, 100)).toBe(false);
  });
  it('three or four light hits defeat a regular enemy', () => {
    expect(ATTACKS.light.damage * 3 + 8).toBeLessThan(72);
    expect(ATTACKS.light.damage * 4 + 8).toBeGreaterThanOrEqual(72);
    expect(ATTACKS.heavy.windup).toBeGreaterThan(ATTACKS.light.windup);
  });
});
