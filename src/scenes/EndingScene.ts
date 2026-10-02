import Phaser from 'phaser';
import { World } from '../world/World';
import { Input } from '../systems/Input';
import { ui } from '../ui/Interface';
import { audio } from '../systems/AudioSystem';
export class EndingScene extends Phaser.Scene {
  private world!: World;
  private keys!: Input;
  private page = 0;
  private entered = 0;
  constructor() {
    super('Ending');
  }
  create() {
    this.page = 0;
    this.entered = performance.now();
    this.world = new World(this);
    this.keys = new Input(this);
    this.cameras.main.scrollX = 2700;
    this.cameras.main.fadeIn(1500, 8, 19, 18);
    audio.play('gong');
    this.show();
  }
  private show() {
    if (this.page === 0)
      ui.cinematic(
        '17 FEBRUARI 1942',
        'SEBUAH BINGKAI NARATIF',
        'Kampung kembali tenang. Amanah itu baru bermula.',
        'Sambung',
        () => this.next(),
      );
    else if (this.page === 1)
      ui.cinematic(
        'GAYONGX<br>WARISAN',
        'BERSAMBUNG…',
        'Terima kasih kerana bermain. Seni dan audio dijana secara asli. Watak Arif, dialog dan peristiwa gameplay ialah fiksyen.',
        'Menu utama',
        () => this.next(),
      );
    else this.scene.start('Menu');
  }
  private next() {
    if (performance.now() - this.entered < 350) return;
    this.page++;
    this.entered = performance.now();
    this.show();
  }
  update(time: number, delta: number) {
    this.world.setReduced(ui.reduced);
    if (!ui.reduced) {
      this.world.update(time, delta);
      this.cameras.main.scrollX += delta * 0.022;
    }
    if (this.keys.pressed('ENTER') || this.keys.pressed('E')) this.next();
    if (performance.now() - this.entered > 11000) this.next();
  }
}
