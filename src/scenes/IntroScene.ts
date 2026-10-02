import Phaser from 'phaser';
import { World } from '../world/World';
import { Input } from '../systems/Input';
import { ui } from '../ui/Interface';
import { DISCLAIMER } from '../data/story';
import { audio } from '../systems/AudioSystem';
export class IntroScene extends Phaser.Scene {
  private world!: World;
  private keys!: Input;
  private page = 0;
  private entered = 0;
  constructor() {
    super('Intro');
  }
  create() {
    this.page = 0;
    this.entered = performance.now();
    this.world = new World(this);
    this.keys = new Input(this);
    this.cameras.main.setAlpha(0);
    audio.play('gong');
    this.show();
  }
  private show() {
    if (this.page === 0) ui.cinematic('TANAH MELAYU', '1942', '', 'Sambung', () => this.next());
    else if (this.page === 1) {
      this.cameras.main.setAlpha(1).fadeIn(1800, 0, 0, 0);
      ui.cinematic(
        'PULAU SUDONG',
        'SEBUAH KAMPUNG PESISIR',
        'Di tengah ketidakpastian perang, seorang anak kampung belajar makna mempertahankan.',
        'Sambung',
        () => this.next(),
      );
    } else if (this.page === 2)
      ui.cinematic(
        'Warisan & fiksyen',
        'CATATAN SEBELUM BERMULA',
        DISCLAIMER,
        'Mulakan perjalanan',
        () => this.next(),
      );
    else this.scene.start('Village', { chapter: 'village' });
  }
  private next() {
    if (performance.now() - this.entered < 250) return;
    this.page++;
    this.entered = performance.now();
    this.show();
  }
  update(time: number, delta: number) {
    this.world.setReduced(ui.reduced);
    if (!ui.reduced) {
      this.world.update(time, delta);
      this.cameras.main.scrollX += delta * 0.013;
    }
    if (this.keys.pressed('ENTER') || this.keys.pressed('E')) this.next();
    if (this.page < 2 && performance.now() - this.entered > 6500) this.next();
  }
}
