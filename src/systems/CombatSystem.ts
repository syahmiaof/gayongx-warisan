import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ATTACKS, inReach, defend, canFinish } from './rules';
import { audio } from './AudioSystem';
export type CombatEvent =
  'light' | 'combo' | 'heavy' | 'block' | 'parry' | 'dodge' | 'finisher' | 'hurt';
export class CombatSystem {
  hitStop = 0;
  lastToken = 0;
  constructor(
    private scene: Phaser.Scene,
    private onEvent: (event: CombatEvent) => void,
    private reduced: () => boolean,
  ) {}
  resolve(player: Player, enemies: Enemy[], now: number, trainingStep: number) {
    if (player.attack) {
      const spec = ATTACKS[player.attack];
      if (player.attackTime >= spec.windup && player.attackTime <= spec.windup + spec.active) {
        for (const e of enemies) {
          if (
            e.health <= 0 ||
            player.attacksHit.has(e) ||
            !inReach(player.x, player.y, player.facing, e.x, e.y, spec.reach)
          )
            continue;
          if (
            player.attack === 'finisher' &&
            !(e.training && trainingStep === 5) &&
            !canFinish(e.health, e.maxHealth)
          )
            continue;
          player.attacksHit.add(e);
          if (e.state === 'BLOCK' && player.attack === 'light') {
            this.impact(e.x, e.y - 65, 0xa4b8a5, false);
            audio.play('block');
            continue;
          }
          const damage = spec.damage + (player.attack === 'light' && player.combo === 3 ? 8 : 0);
          e.hurt(damage, player.facing, now);
          this.impact((player.x + e.x) / 2, e.y - 64, 0xf0c589, player.attack !== 'light');
          this.hitStop = player.attack === 'heavy' ? 75 : player.attack === 'finisher' ? 115 : 42;
          if (player.attack === 'finisher') {
            player.counters.finisher++;
            this.onEvent('finisher');
          } else if (player.attack === 'heavy') this.onEvent('heavy');
          else {
            this.onEvent('light');
            if (player.combo === 3) this.onEvent('combo');
          }
          if (!e.training && e.hitsTaken % 3 === 0 && e.health > 0) e.cooldown = now + 650;
        }
      }
    }
    for (const e of enemies) {
      if (e.state !== 'ATTACK' || e.attackApplied || now - e.stateAt < e.windup) continue;
      e.attackApplied = true;
      this.lastToken = now;
      const close = inReach(e.x, e.y, e.facing, player.x, player.y, 112);
      if (!close) {
        if (now < player.dodgeUntil && Math.abs(e.x - player.x) < 240) {
          player.counters.dodge++;
          this.onEvent('dodge');
        }
        continue;
      }
      if (now < player.immuneUntil || player.health <= 0) continue;
      const result = defend({
        dodging: now < player.dodgeUntil,
        blocking: player.blocking,
        facingAttack: (e.x - player.x) * player.facing >= -10,
        sinceBlock: now - player.blockStarted,
      });
      if (result === 'dodge') {
        player.counters.dodge++;
        this.onEvent('dodge');
      }
      if (result === 'parry') {
        player.counters.parry++;
        e.hurt(8, player.facing, now, true);
        audio.play('parry');
        this.impact(player.x + player.facing * 36, player.y - 75, 0xd5f0df, true);
        this.hitStop = 85;
        this.onEvent('parry');
      }
      if (result === 'block') {
        player.counters.block++;
        audio.play('block');
        this.impact(player.x + player.facing * 24, player.y - 69, 0xabbfb3, false);
        player.x += e.facing * 9;
        this.onEvent('block');
      }
      if (result === 'hit') {
        if (!e.training) player.hurt(e.boss ? 17 : 11, e.facing, now);
        else {
          player.stunUntil = now + 180;
          player.setPose('hit');
        }
        this.impact(player.x, player.y - 63, 0xcf8264, false);
        audio.play('hurt');
        this.onEvent('hurt');
      }
    }
  }
  private impact(x: number, y: number, color: number, heavy: boolean) {
    if (!this.reduced()) this.scene.cameras.main.shake(heavy ? 120 : 55, heavy ? 0.004 : 0.0013);
    for (let i = 0; i < (heavy ? 12 : 7); i++) {
      const p = this.scene.add
        .rectangle(x, y, 2 + Math.random() * 3, 2, color)
        .setDepth(24)
        .setRotation(Math.random() * 6);
      this.scene.tweens.add({
        targets: p,
        x: x + (Math.random() - 0.5) * 120,
        y: y + (Math.random() - 0.7) * 90,
        alpha: 0,
        duration: 180 + Math.random() * 180,
        onComplete: () => p.destroy(),
      });
    }
  }
}
