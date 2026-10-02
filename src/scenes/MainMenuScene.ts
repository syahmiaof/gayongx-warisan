import Phaser from 'phaser';
import { World } from '../world/World';
import { Fighter } from '../entities/Fighter';
import { ui } from '../ui/Interface';
import { audio } from '../systems/AudioSystem';
export class MainMenuScene extends Phaser.Scene {
  private world!: World;
  private hero!: Fighter;
  constructor() {
    super('Menu');
  }
  create() {
    this.world = new World(this);
    this.cameras.main.scrollX = 640;
    this.hero = new Fighter(this, 1545, 0x233b35, 0xc1a071, 1.72);
    this.hero.y = 590;
    this.hero.facing = -1;
    this.hero.setPose('block');
    ui.menu(() => this.scene.start('Intro'));
    audio.pause(false);
    this.cameras.main.fadeIn(700, 8, 18, 17);
  }
  update(time: number, delta: number) {
    this.world.setReduced(ui.reduced);
    if (!ui.reduced) this.world.update(time, delta);
    this.hero.render(delta, time);
  }
}
