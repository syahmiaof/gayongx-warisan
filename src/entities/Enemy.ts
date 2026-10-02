import Phaser from 'phaser';
import { Fighter } from './Fighter';
import type { Player } from './Player';
import type { EnemyState } from '../systems/rules';
export class Enemy extends Fighter {
  state: EnemyState = 'IDLE';
  stateAt = 0;
  cooldown = 0;
  attackApplied = false;
  windup = 690;
  stunnedUntil = 0;
  hitsTaken = 0;
  private label: Phaser.GameObjects.Text;
  private bar: Phaser.GameObjects.Graphics;
  constructor(
    scene: Phaser.Scene,
    x: number,
    public boss = false,
    public training = false,
  ) {
    super(
      scene,
      x,
      training ? 0x667267 : boss ? 0x563d38 : 0x3b4544,
      boss ? 0x8f6954 : 0x998365,
      boss ? 1.12 : 1,
    );
    this.health = this.maxHealth = training ? 999 : boss ? 132 : 72;
    this.windup = boss ? 610 : 730;
    this.label = scene.add
      .text(x, 410, '', {
        fontFamily: 'Manrope',
        fontSize: '12px',
        color: '#f4dfb6',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.bar = scene.add.graphics().setDepth(20);
  }
  enter(state: EnemyState, now: number) {
    this.state = state;
    this.stateAt = now;
    if (state === 'ATTACK') this.attackApplied = false;
  }
  tick(dt: number, now: number, player: Player, canAttack: boolean, trainingStep = -1) {
    if (this.health <= 0) {
      this.enter('DEFEATED', now);
      this.setPose('down');
      this.render(dt, now);
      this.label.setText('');
      this.bar.clear();
      return;
    }
    const dx = player.x - this.x,
      dist = Math.abs(dx);
    this.facing = dx < 0 ? -1 : 1;
    if (this.state === 'HIT') {
      this.setPose('hit');
      this.x += (this.vx * dt) / 1000;
      this.vx *= Math.pow(0.03, dt / 1000);
      if (now >= this.stunnedUntil)
        this.enter(!this.training && this.hitsTaken % 3 === 0 ? 'BLOCK' : 'CHASE', now);
    } else if (this.state === 'ATTACK') {
      this.setPose(now - this.stateAt < this.windup ? 'block' : 'light');
      if (now - this.stateAt > this.windup + 260) {
        this.cooldown = now + (this.training ? 1300 : this.boss ? 740 : 1150);
        this.enter('CHASE', now);
      }
    } else if (this.state === 'BLOCK') {
      this.setPose('block');
      if (now - this.stateAt > 650) this.enter('CHASE', now);
    } else if (this.training) {
      this.setPose('idle');
      this.enter('IDLE', now);
      if (trainingStep >= 2 && trainingStep <= 4 && canAttack && now >= this.cooldown) {
        if (dist > 85) {
          this.x += (Math.sign(dx) * 100 * dt) / 1000;
          this.setPose('walk');
        } else this.enter('ATTACK', now);
      }
    } else if (dist > 520) {
      this.enter('PATROL', now);
      this.x += (Math.sin(now * 0.001) * 15 * dt) / 1000;
      this.setPose('walk');
    } else if (dist > 85) {
      this.enter('CHASE', now);
      this.setPose('walk');
      this.x += (Math.sign(dx) * (this.boss ? 137 : 108) * dt) / 1000;
    } else if (canAttack && now >= this.cooldown) {
      this.enter('ATTACK', now);
    } else {
      this.setPose('idle');
      this.enter('IDLE', now);
    }
    this.x = this.training
      ? Phaser.Math.Clamp(this.x, 1790, 2080)
      : Phaser.Math.Clamp(this.x, 40, 5320);
    this.render(dt, now);
    this.drawStatus(now, dist);
  }
  private drawStatus(now: number, dist: number) {
    this.bar.clear();
    this.label.setPosition(this.x, this.y - 159);
    if (this.state === 'ATTACK') {
      const imminent = this.windup - (now - this.stateAt) <= 190;
      this.label
        .setText(imminent ? 'TANGKIS!' : 'SERANGAN')
        .setColor(imminent ? '#fff4dc' : '#e8b17c');
      this.bar.lineStyle(imminent ? 3 : 2, imminent ? 0xffefc9 : 0xc58f59);
      this.bar.strokeCircle(this.x, this.y - 128, 7 + Math.sin(now * 0.02) * 2);
    } else
      this.label.setText(
        this.training
          ? 'RAKAN LATIHAN'
          : this.health <= this.maxHealth * 0.3
            ? 'F · JATUHAN'
            : this.boss
              ? 'KETUA PENCEROBOH'
              : dist < 250
                ? 'PENCEROBOH'
                : '',
      );
    if (!this.training && dist < 430) {
      this.bar.fillStyle(0x172824, 0.8);
      this.bar.fillRect(this.x - 30, this.y - 140, 60, 3);
      this.bar.fillStyle(this.boss ? 0xd5ab6a : 0xc8866a);
      this.bar.fillRect(this.x - 30, this.y - 140, (60 * this.health) / this.maxHealth, 3);
    }
  }
  hurt(damage: number, dir: number, now: number, parried = false) {
    if (this.state === 'DEFEATED') return;
    if (!this.training) this.health = Math.max(0, this.health - damage);
    this.hitsTaken++;
    this.enter('HIT', now);
    this.stunnedUntil = now + (parried ? 1150 : 340);
    this.vx = dir * (parried || this.training ? 70 : 160);
    this.setPose('hit');
  }
  override destroy() {
    super.destroy();
    this.label.destroy();
    this.bar.destroy();
  }
}
