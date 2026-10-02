import Phaser from 'phaser';
export const GROUND = 566;
export const WORLD_WIDTH = 5400;
export class World {
  private water: Phaser.GameObjects.TileSprite;
  private motes: Phaser.GameObjects.Arc[] = [];
  private ambientTweens: Phaser.Tweens.Tween[] = [];
  private reduced = false;
  constructor(private scene: Phaser.Scene) {
    scene.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-100);
    scene.add
      .tileSprite(0, 80, 7000, 360, 'island')
      .setOrigin(0)
      .setScrollFactor(0.13)
      .setDepth(-90)
      .setAlpha(0.68);
    this.water = scene.add
      .tileSprite(0, 386, 7000, 280, 'water')
      .setOrigin(0)
      .setScrollFactor(0.22)
      .setDepth(-80);
    for (let i = 0; i < 6; i++)
      scene.add
        .image(320 + i * 950, 477, 'boat')
        .setScale(0.38)
        .setDepth(-65)
        .setScrollFactor(0.4)
        .setAlpha(0.65);
    for (let i = 0; i < 14; i++)
      scene.add
        .image(i * 430 + 130, 527, 'palm')
        .setOrigin(0.5, 1)
        .setScale(0.57 + (i % 3) * 0.07)
        .setDepth(-60)
        .setScrollFactor(0.62)
        .setTint(0x789282)
        .setAlpha(0.72);
    for (const [x, y, s] of [
      [450, 566, 1],
      [1070, 560, 0.85],
      [2240, 560, 1.05],
      [2830, 555, 0.75],
      [5030, 560, 0.85],
    ])
      scene.add.image(x, y, 'house').setOrigin(0.5, 1).setScale(s).setDepth(-30);
    for (const x of [130, 820, 1400, 2550, 3030, 4900, 5330]) {
      const palm = scene.add
        .image(x, GROUND, 'palm')
        .setOrigin(0.5, 1)
        .setScale(0.87 + (x % 3) * 0.035)
        .setDepth(-20);
      this.ambientTweens.push(
        scene.tweens.add({
          targets: palm,
          angle: { from: -0.7, to: 0.7 },
          duration: 3600 + (x % 900),
          yoyo: true,
          repeat: -1,
        }),
      );
    }
    scene.add.tileSprite(0, GROUND, 6000, 170, 'ground').setOrigin(0).setDepth(-10);
    const dock = scene.add.graphics().setDepth(-9);
    dock.fillStyle(0x383a2c);
    dock.fillRect(3180, 564, 1660, 32);
    dock.lineStyle(2, 0x978561, 0.55);
    for (let x = 3180; x < 4840; x += 33) dock.lineBetween(x, 568, x + 15, 593);
    for (let x = 3210; x < 4840; x += 150) {
      dock.fillStyle(0x273a30);
      dock.fillRect(x, 550, 12, 155);
      dock.lineStyle(3, 0x8a7a54, 0.5);
      dock.lineBetween(x, 552, x, 696);
    }
    for (const x of [3400, 4080, 4540]) {
      scene.add.image(x, 656, 'boat').setScale(0.95).setDepth(6);
    }
    // Fishing racks, rope coils and lamps.
    for (const x of [630, 1250, 2630, 3340, 4790]) {
      const props = scene.add.graphics().setDepth(-8);
      props.lineStyle(5, 0x504f38);
      props.lineBetween(x, 566, x, 464);
      props.lineBetween(x + 110, 566, x + 105, 464);
      props.lineBetween(x - 8, 472, x + 121, 472);
      props.lineStyle(1, 0xa99a71, 0.5);
      for (let j = 0; j < 8; j++) {
        props.lineBetween(x + j * 14, 476, x + 20 + j * 10, 544);
        props.lineBetween(x + 4, 480 + j * 8, x + 108, 480 + j * 8);
      }
      props.lineStyle(3, 0x88794e);
      for (let j = 0; j < 4; j++) props.strokeEllipse(x - 20, 559 - j * 3, 30 - j * 4, 9);
    }
    for (const x of [345, 1050, 1760, 2325, 3130, 3740, 4480, 5080]) {
      const pole = scene.add.graphics().setDepth(-5);
      pole.fillStyle(0x263a30);
      pole.fillRect(x, 426, 6, 140);
      pole.fillRect(x - 20, 427, 28, 5);
      pole.lineStyle(1, 0xac986c);
      pole.lineBetween(x - 16, 429, x - 16, 445);
      const light = scene.add.circle(x - 16, 456, 28, 0xeec77a, 0.065).setDepth(-4);
      scene.add.rectangle(x - 16, 456, 11, 18, 0xebbd70).setDepth(-3);
      scene.add.rectangle(x - 16, 445, 17, 4, 0x2a382b).setDepth(-2);
      this.ambientTweens.push(
        scene.tweens.add({
          targets: light,
          alpha: { from: 0.45, to: 1 },
          scale: { from: 0.9, to: 1.2 },
          duration: 750 + (x % 600),
          yoyo: true,
          repeat: -1,
        }),
      );
    }
    for (let i = 0; i < 12; i++)
      scene.add
        .image(i * 570 - 50, 746, 'foliage')
        .setOrigin(0.5, 1)
        .setDepth(30)
        .setScrollFactor(1.12)
        .setScale(0.7 + (i % 3) * 0.17);
    for (let i = 0; i < 26; i++) {
      const dot = scene.add
        .circle((i * 193) % 1280, 170 + ((i * 71) % 420), i % 3 === 0 ? 2 : 1, 0xf4d898, 0.25)
        .setScrollFactor(0)
        .setDepth(25);
      this.motes.push(dot);
    }
    scene.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(70);
    // Birds in the distance, deliberately small enough to belong to the horizon.
    const birds = scene.add
      .graphics()
      .setScrollFactor(0.05)
      .setDepth(-50)
      .lineStyle(1.5, 0x354c42, 0.7);
    for (let i = 0; i < 7; i++) {
      const x = 500 + i * 27,
        y = 240 + Math.sin(i) * 18;
      birds.lineBetween(x - 5, y - 3, x, y);
      birds.lineBetween(x, y, x + 6, y - 4);
    }
  }
  setReduced(reduced: boolean, force = false) {
    if (this.reduced === reduced && !force) return;
    this.reduced = reduced;
    this.ambientTweens.forEach((t) => (reduced ? t.pause() : t.resume()));
  }
  update(time: number, delta: number) {
    this.water.tilePositionX = time * 0.003;
    for (let i = 0; i < this.motes.length; i++) {
      const p = this.motes[i];
      p.x = (p.x + delta * (0.006 + (i % 3) * 0.003)) % 1280;
      p.y += Math.sin(time * 0.0006 + i) * delta * 0.002;
    }
  }
}
