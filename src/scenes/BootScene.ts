import Phaser from 'phaser';
import { createArt } from '../world/Art';
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }
  create() {
    createArt(this);
    void document.fonts.ready.then(() => {
      if (this.scene.isActive()) this.scene.start('Menu');
    });
  }
}
