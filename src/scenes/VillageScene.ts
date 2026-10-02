import Phaser from 'phaser';
import { World, GROUND, WORLD_WIDTH } from '../world/World';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { Input } from '../systems/Input';
import { CombatSystem, type CombatEvent } from '../systems/CombatSystem';
import { ui } from '../ui/Interface';
import { audio } from '../systems/AudioSystem';
import { mentor, alarm, conclusion, training } from '../data/story';
export type Chapter = 'village' | 'training' | 'jetty' | 'combat' | 'final';
export class VillageScene extends Phaser.Scene {
  player!: Player;
  enemies: Enemy[] = [];
  npcs: NPC[] = [];
  chapter: Chapter = 'village';
  trainingStep = 0;
  clock = 0;
  paused = false;
  dead = false;
  private world!: World;
  private keys!: Input;
  private combat!: CombatSystem;
  private showDebug = false;
  private transitioning = false;
  private checkpoint: Chapter = 'village';
  private eventCounts: Record<string, number> = {};
  constructor() {
    super('Village');
  }
  create(data: { chapter?: Chapter }) {
    this.time.paused = false;
    this.chapter = data.chapter ?? 'village';
    this.checkpoint = this.chapter;
    this.enemies = [];
    this.npcs = [];
    this.clock = 0;
    this.paused = false;
    this.dead = false;
    this.showDebug = false;
    this.trainingStep = 0;
    this.eventCounts = {};
    this.transitioning = false;
    this.world = new World(this);
    this.keys = new Input(this);
    this.combat = new CombatSystem(
      this,
      (e) => this.onCombat(e),
      () => ui.reduced,
    );
    const starts: Record<Chapter, number> = {
      village: 160,
      training: 1730,
      jetty: 2130,
      combat: 3370,
      final: 4390,
    };
    this.player = new Player(this, starts[this.chapter]);
    this.npcs.push(
      new NPC(this, 660, 'NELAYAN', [
        'Laut masih memberi rezeki. Tapi khabar dari tanah besar buat kami berjaga.',
        'Kalau ke hujung kampung, sampaikan salam pada Meor.',
      ]),
    );
    this.npcs.push(
      new NPC(this, 1220, 'ORANG TUA', ['Hati-hati di jalan, Arif. Bantu orang yang memerlukan.']),
    );
    this.npcs.push(new NPC(this, 1650, 'MEOR ABDUL RAHMAN', [], true));
    this.npcs.push(
      new NPC(this, 2740, 'PENDUDUK', [
        'Kami bawa keluarga pulang. Tolong pastikan laluan jeti selamat.',
      ]),
    );
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 720);
    this.cameras.main.scrollX = Math.max(0, this.player.x - 400);
    this.cameras.main.fadeIn(650, 9, 24, 22);
    ui.hud(() => this.pause());
    audio.pause(false);
    if (this.chapter === 'training') this.startTraining();
    else if (this.chapter === 'combat') this.startCombat();
    else if (this.chapter === 'final') this.startFinal();
    else this.setObjective();
    const blur = () => {
      if (this.scene.isActive() && !this.paused && !this.dead) this.pause();
    };
    this.game.events.on(Phaser.Core.Events.BLUR, blur);
    const visibility = () => {
      if (document.hidden) blur();
    };
    const orientation = () => {
      if (matchMedia('(pointer: coarse) and (orientation: portrait)').matches) blur();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', orientation);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', orientation);
      this.game.events.off(Phaser.Core.Events.BLUR, blur);
      audio.pause(false);
      ui.clear();
    });
  }
  private setObjective() {
    const states: Record<Chapter, [string, string, string]> = {
      village: ['01 · KAMPUNG PESISIR', 'Temui Meor di hujung kampung →', '01 / 04'],
      training: ['02 · ILMU & AMANAH', 'Lengkapkan latihan bersama Meor', '02 / 04'],
      jetty: ['03 · PANGGILAN JETI', 'Pergi ke jeti →', '03 / 04'],
      combat: ['03 · PERTAHANKAN JETI', 'Lindungi kampung · tewaskan 3 penceroboh', '03 / 04'],
      final: ['04 · AMANAH', 'Hadapi ketua penceroboh', '04 / 04'],
    };
    ui.objective(...states[this.chapter]);
  }
  private startTraining() {
    this.chapter = this.checkpoint = 'training';
    this.trainingStep = 0;
    this.player.x = 1775;
    this.player.facing = 1;
    this.enemies.forEach((e) => e.destroy());
    this.enemies = [new Enemy(this, 1870, false, true)];
    this.setObjective();
    ui.combatHints();
    this.showLesson();
  }
  private showLesson() {
    const step = training[this.trainingStep];
    ui.lesson(step.title, step.text, step.key);
    const e = this.enemies[0];
    if (e) {
      e.cooldown = this.clock + 1100;
      e.enter('IDLE', this.clock);
    }
  }
  private onCombat(event: CombatEvent) {
    this.eventCounts[event] = (this.eventCounts[event] ?? 0) + 1;
    const messages: Partial<Record<CombatEvent, string>> = {
      combo: 'KOMBO 3 HIT',
      heavy: 'SERANGAN BERAT',
      block: 'BLOK',
      parry: 'TANGKIS SEMPURNA',
      dodge: 'ELAK',
      finisher: 'JATUHAN',
    };
    if (messages[event]) ui.notice(messages[event]!);
    if (event === 'hurt' && this.chapter === 'training')
      ui.notice(
        this.trainingStep === 3
          ? 'Tekan L ketika tanda putih muncul.'
          : this.trainingStep === 4
            ? 'Tekan Q sebelum pukulan tiba.'
            : 'Tahan L dan hadap rakan latihan.',
      );
    if (this.chapter !== 'training' || this.transitioning) return;
    const expected: CombatEvent[] = ['combo', 'heavy', 'block', 'parry', 'dodge', 'finisher'];
    if (event === expected[this.trainingStep]) {
      this.trainingStep++;
      if (this.trainingStep >= training.length) {
        this.transitioning = true;
        ui.hideLesson();
        this.enemies.forEach((e) => e.destroy());
        this.enemies = [];
        this.time.delayedCall(700, () => {
          ui.dialog(alarm, () => {
            this.chapter = this.checkpoint = 'jetty';
            this.transitioning = false;
            this.player.health = 100;
            this.player.attack = null;
            this.player.setPose('idle');
            this.setObjective();
            ui.notice('LATIHAN SELESAI');
          });
        });
      } else this.showLesson();
    }
  }
  private startCombat() {
    this.chapter = this.checkpoint = 'combat';
    this.player.health = 100;
    this.player.attack = null;
    this.enemies = [new Enemy(this, 3520), new Enemy(this, 3780), new Enemy(this, 4030)];
    this.enemies.forEach((e, i) => {
      e.cooldown = this.clock + 800 + i * 650;
    });
    this.setObjective();
    ui.combatHints();
    ui.hideLesson();
    audio.play('gong');
  }
  private startFinal() {
    this.chapter = this.checkpoint = 'final';
    this.player.health = 100;
    this.player.attack = null;
    this.enemies.forEach((e) => e.destroy());
    this.enemies = [new Enemy(this, 4660, true)];
    this.enemies[0].cooldown = this.clock + 1600;
    this.setObjective();
    ui.combatHints();
    ui.notice('TENAGA DIPULIHKAN · SATU PERTEMBUNGAN TERAKHIR');
    audio.play('gong');
  }
  pause() {
    if (this.paused || this.dead) return;
    this.paused = true;
    this.keys.reset();
    this.tweens.pauseAll();
    this.time.paused = true;
    audio.pause(true);
    ui.pause(
      () => this.resume(),
      () => this.restart(),
      () => this.scene.start('Menu'),
    );
  }
  private resume() {
    this.paused = false;
    this.keys.reset();
    this.tweens.resumeAll();
    this.world.setReduced(ui.reduced, true);
    this.time.paused = false;
    audio.pause(false);
    ui.closeOverlay();
  }
  private restart() {
    this.time.paused = false;
    this.scene.restart({ chapter: this.checkpoint });
  }
  private interact() {
    const npc = this.npcs.find((n) => Math.abs(n.x - this.player.x) < 125);
    if (!npc) return;
    if (npc.name === 'MEOR ABDUL RAHMAN') {
      if (this.chapter === 'village') ui.dialog(mentor, () => this.startTraining());
      else
        ui.dialog(
          [{ name: npc.name, text: 'Jaga jarak, Arif. Tenangkan langkah sebelum bertindak.' }],
          () => {},
        );
    } else
      ui.dialog(
        npc.lines.map((text) => ({ name: npc.name, text })),
        () => {},
      );
  }
  update(_time: number, rawDelta: number) {
    if (this.keys.pressed('ESC') && !this.dead) {
      if (this.paused) this.resume();
      else this.pause();
    }
    if (this.paused || this.dead) return;
    if (import.meta.env.DEV) {
      if (this.keys.pressed('F1')) this.showDebug = !this.showDebug;
      if (this.keys.pressed('ONE')) {
        this.scene.restart({ chapter: 'village' });
        return;
      }
      if (this.keys.pressed('TWO')) {
        this.scene.restart({ chapter: 'training' });
        return;
      }
      if (this.keys.pressed('THREE')) {
        this.scene.restart({ chapter: 'combat' });
        return;
      }
      if (this.keys.pressed('FOUR')) {
        this.scene.start('Ending');
        return;
      }
    }
    const dt = Math.min(rawDelta, 40);
    ui.tick();
    if (ui.talking) {
      if (this.keys.pressed('E') || this.keys.pressed('ENTER')) {
        ui.nextDialog();
        this.keys.reset();
      }
      return;
    }
    if (this.transitioning) return;
    if (this.combat.hitStop > 0) {
      this.combat.hitStop -= dt;
      return;
    }
    this.clock += dt;
    this.world.setReduced(ui.reduced);
    if (!ui.reduced) this.world.update(this.clock, dt);
    // Touch players have no precise facing key: settle toward the nearest close threat.
    if (
      this.keys.usingTouch &&
      !this.keys.down('A') &&
      !this.keys.down('D') &&
      !this.player.attack
    ) {
      const nearest = this.enemies
        .filter((e) => e.health > 0)
        .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
      if (nearest && Math.abs(nearest.x - this.player.x) < 160)
        this.player.facing = nearest.x >= this.player.x ? 1 : -1;
    }
    this.player.tick(dt, this.clock, this.keys, this.chapter !== 'village');
    if (this.chapter === 'training') this.player.x = Phaser.Math.Clamp(this.player.x, 1710, 2150);
    if (this.chapter === 'combat') this.player.x = Phaser.Math.Clamp(this.player.x, 3250, 4240);
    if (this.chapter === 'final') this.player.x = Phaser.Math.Clamp(this.player.x, 4310, 5010);
    this.npcs.forEach((n) => n.tick(dt, this.clock, this.player.x));
    // One attacker owns the token; nearby opponents wait their turn.
    const alive = this.enemies.filter((e) => e.health > 0),
      active = alive.find((e) => e.state === 'ATTACK');
    const candidate = alive
      .filter((e) => this.clock >= e.cooldown && e.state !== 'HIT')
      .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
    for (const e of this.enemies)
      e.tick(
        dt,
        this.clock,
        this.player,
        !active && e === candidate && this.clock - this.combat.lastToken > 440,
        this.chapter === 'training' ? this.trainingStep : -1,
      );
    this.combat.resolve(
      this.player,
      [...this.enemies],
      this.clock,
      this.chapter === 'training' ? this.trainingStep : -1,
    );
    ui.health(this.player.health);
    const camera = this.cameras.main,
      target = Phaser.Math.Clamp(
        this.player.x - 500 + this.player.facing * 65,
        0,
        WORLD_WIDTH - 1280,
      );
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, target, 1 - Math.exp(-dt * 0.005));
    if (this.chapter === 'village' && this.player.x > 1540 && this.player.x < 1770)
      ui.interaction('E · Temui Meor');
    else ui.interaction('');
    if (this.keys.pressed('E')) this.interact();
    if (this.chapter === 'village' && this.player.x > 1750) this.player.x = 1750;
    if (this.chapter === 'jetty' && this.player.x > 3290) this.startCombat();
    if (this.chapter === 'combat' && this.enemies.every((e) => e.health <= 0)) {
      this.transitioning = true;
      ui.dialog(
        [{ name: 'ARIF', text: 'Laluan sudah selamat. Masih ada seorang di hujung jeti.' }],
        () => {
          this.player.x = 4390;
          this.startFinal();
          this.transitioning = false;
        },
      );
    }
    if (this.chapter === 'final' && this.enemies.every((e) => e.health <= 0)) {
      this.transitioning = true;
      ui.hideLesson();
      ui.dialog(conclusion, () => this.scene.start('Ending'));
    }
    if (this.player.health <= 0) {
      this.dead = true;
      audio.play('gong');
      ui.defeat(
        () => this.restart(),
        () => this.scene.start('Menu'),
      );
    }
    if (import.meta.env.DEV)
      ui.debug(
        `FPS ${Math.round(this.game.loop.actualFps)} | ${this.chapter}\nx ${Math.round(this.player.x)} / y ${Math.round(this.player.y)}\nHP ${this.player.health} | combo ${this.player.combo}\n${this.enemies.map((e) => `${e.state} HP ${e.health}`).join(' / ')}\n1 village · 2 training · 3 combat · 4 ending`,
        this.showDebug,
      );
  }
  snapshot() {
    return {
      chapter: this.chapter,
      trainingStep: this.trainingStep,
      clock: this.clock,
      paused: this.paused,
      dead: this.dead,
      talking: ui.talking,
      player: {
        x: this.player.x,
        y: this.player.y,
        health: this.player.health,
        pose: this.player.pose,
        combo: this.player.combo,
        blocking: this.player.blocking,
        counters: this.player.counters,
      },
      enemies: this.enemies.map((e) => ({
        x: e.x,
        health: e.health,
        state: e.state,
        windup: e.windup,
        elapsed: this.clock - e.stateAt,
        training: e.training,
      })),
      events: { ...this.eventCounts },
    };
  }
}
