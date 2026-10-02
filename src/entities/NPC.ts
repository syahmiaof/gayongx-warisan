import Phaser from 'phaser';
import { Fighter } from './Fighter';
export class NPC extends Fighter {
  private label: Phaser.GameObjects.Text;
  constructor(
    scene: Phaser.Scene,
    x: number,
    public name: string,
    public lines: string[],
    mentor = false,
  ) {
    super(
      scene,
      x,
      mentor ? 0x626855 : 0x4e5d50,
      mentor ? 0xd2ba86 : 0x9b8560,
      mentor ? 1.05 : 0.93,
    );
    this.label = scene.add
      .text(x, 409, '', { fontFamily: 'Manrope', fontSize: '12px', color: '#ecd5a6' })
      .setOrigin(0.5)
      .setDepth(21);
  }
  tick(dt: number, now: number, playerX: number) {
    const close = Math.abs(playerX - this.x) < 120;
    this.label.setText(close ? `E · ${this.name}` : '');
    if (close) this.facing = playerX < this.x ? -1 : 1;
    this.render(dt, now);
  }
}
