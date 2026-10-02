import Phaser from 'phaser';
import { Fighter } from './Fighter';
import { GROUND, WORLD_WIDTH } from '../world/World';
import { Input } from '../systems/Input';
import { ATTACKS, DODGE_IFRAMES, nextCombo, type AttackKind } from '../systems/rules';
import { audio } from '../systems/AudioSystem';
export class Player extends Fighter {
  attack: AttackKind | null = null;
  attackTime = 0;
  attackId = 0;
  combo = 0;
  lastLight = -1000;
  blockStarted = -1000;
  blocking = false;
  dodgeUntil = 0;
  dodgeCooldown = 0;
  stunUntil = 0;
  immuneUntil = 0;
  attacksHit = new Set<object>();
  private buffer: AttackKind | null = null;
  private bufferUntil = 0;
  private stepAt = 0;
  counters = { light: 0, heavy: 0, block: 0, parry: 0, dodge: 0, finisher: 0, jump: 0, damage: 0 };
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, 0x29433e, 0xbda371, 1.04);
  }
  tick(dt: number, now: number, input: Input, combat: boolean) {
    if (this.health <= 0) {
      this.setPose('down');
      this.render(dt, now);
      return;
    }
    const l = input.pressed('L');
    if (l) this.blockStarted = now;
    if (input.pressed('J') && combat) {
      this.buffer = 'light';
      this.bufferUntil = now + 220;
    }
    if (input.pressed('K') && combat) {
      this.buffer = 'heavy';
      this.bufferUntil = now + 220;
    }
    if (input.pressed('F') && combat) {
      this.buffer = 'finisher';
      this.bufferUntil = now + 220;
    }
    this.blocking =
      input.down('L') &&
      !this.attack &&
      now >= this.stunUntil &&
      now >= this.dodgeUntil &&
      this.y >= GROUND;
    if (now < this.stunUntil) {
      this.setPose('hit');
      this.x += (this.vx * dt) / 1000;
      this.vx *= Math.pow(0.02, dt / 1000);
      this.physics(dt);
      this.render(dt, now);
      return;
    }
    if (input.pressed('Q') && now >= this.dodgeCooldown && this.y >= GROUND && !this.attack) {
      this.dodgeUntil = now + DODGE_IFRAMES;
      this.dodgeCooldown = now + 720;
      this.blocking = false;
    }
    if (now < this.dodgeUntil) {
      this.setPose('dodge');
      this.x += (this.facing * 480 * dt) / 1000;
      this.x = Phaser.Math.Clamp(this.x, 40, WORLD_WIDTH - 80);
      this.render(dt, now);
      return;
    }
    if (this.attack) {
      this.attackTime += dt;
      const spec = ATTACKS[this.attack];
      this.setPose(this.attack);
      this.poseTime = this.attackTime;
      if (this.attackTime < spec.windup + spec.active && this.attackTime > spec.windup)
        this.x += (this.facing * (this.attack === 'heavy' ? 95 : 55) * dt) / 1000;
      if (this.attackTime >= spec.windup + spec.active + spec.recovery) {
        this.attack = null;
      }
    }
    if (!this.attack && this.buffer && now <= this.bufferUntil && !this.blocking) {
      this.attack = this.buffer;
      this.buffer = null;
      this.attackTime = 0;
      this.attackId++;
      this.attacksHit.clear();
      this.setPose(this.attack);
      if (this.attack === 'light') {
        this.combo = nextCombo(this.combo, now - this.lastLight);
        this.lastLight = now;
        this.counters.light++;
      } else if (this.attack === 'heavy') this.counters.heavy++;
      audio.play(this.attack === 'heavy' ? 'heavy' : 'light');
    }
    if (!this.attack) {
      const axis = Number(input.down('D')) - Number(input.down('A'));
      const speed = input.down('SHIFT') ? 300 : 175;
      if (axis && !this.blocking) {
        this.facing = axis;
        this.x += (axis * speed * dt) / 1000;
        this.setPose('walk');
        if (now > this.stepAt && this.y >= GROUND) {
          audio.play('step');
          this.stepAt = now + (speed > 200 ? 240 : 360);
        }
      } else this.setPose(this.blocking ? 'block' : 'idle');
      if (input.pressed('SPACE') && this.y >= GROUND && !this.blocking) {
        this.vy = -500;
        this.counters.jump++;
      }
    }
    this.physics(dt);
    if (this.y < GROUND && !this.attack) this.setPose('jump');
    this.render(dt, now);
  }
  private physics(dt: number) {
    this.vy += (1350 * dt) / 1000;
    this.y += (this.vy * dt) / 1000;
    if (this.y >= GROUND) {
      this.y = GROUND;
      this.vy = 0;
    }
    this.x = Phaser.Math.Clamp(this.x, 40, WORLD_WIDTH - 80);
  }
  hurt(damage: number, dir: number, now: number) {
    this.health = Math.max(0, this.health - damage);
    this.counters.damage += damage;
    this.stunUntil = now + 310;
    this.immuneUntil = now + 500;
    this.vx = dir * 170;
    this.attack = null;
    this.buffer = null;
    this.blocking = false;
    this.setPose('hit');
  }
}
