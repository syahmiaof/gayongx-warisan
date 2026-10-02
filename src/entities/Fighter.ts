import Phaser from 'phaser';
import { GROUND } from '../world/World';
export type Pose =
  'idle' | 'walk' | 'jump' | 'light' | 'heavy' | 'block' | 'dodge' | 'hit' | 'down' | 'finisher';
export class Fighter {
  x: number;
  y = GROUND;
  vx = 0;
  vy = 0;
  facing = 1;
  health = 100;
  maxHealth = 100;
  pose: Pose = 'idle';
  poseTime = 0;
  protected g: Phaser.GameObjects.Graphics;
  private shadow: Phaser.GameObjects.Ellipse;
  constructor(
    protected scene: Phaser.Scene,
    x: number,
    private color = 0x253f3d,
    private sash = 0xc1a174,
    private size = 1,
  ) {
    this.x = x;
    this.g = scene.add.graphics().setDepth(10);
    this.shadow = scene.add.ellipse(x, GROUND + 3, 65, 13, 0x091f1a, 0.3).setDepth(1);
  }
  setPose(pose: Pose) {
    if (this.pose !== pose) {
      this.pose = pose;
      this.poseTime = 0;
    }
  }
  render(dt: number, time: number) {
    this.poseTime += dt;
    const g = this.g;
    g.clear();
    g.setPosition(this.x, this.y).setScale(this.facing * this.size, this.size);
    this.shadow
      .setPosition(this.x, GROUND + 3)
      .setAlpha(this.pose === 'down' ? 0.15 : 0.3)
      .setScale(Math.max(0.5, 1 - (GROUND - this.y) / 300) * this.size);
    const moving = this.pose === 'walk',
      stride = moving ? Math.sin(time * 0.015) * 15 : 0,
      bob = moving ? Math.abs(Math.sin(time * 0.015)) * 3 : Math.sin(time * 0.002) * 1.3;
    const crouch = this.pose === 'dodge' ? 32 : 0,
      hit = this.pose === 'hit',
      down = this.pose === 'down';
    g.setRotation(down ? (this.facing * -Math.PI) / 2 : hit ? -0.12 * this.facing : 0);
    if (down) {
      g.y -= 12;
      g.setAlpha(0.5);
    } else g.setAlpha(1);
    const t = this.poseTime;
    let handX = 27,
      handY = -65,
      backX = -16,
      backY = -57,
      lean = 0,
      kick = 0;
    if (this.pose === 'light') {
      const reach = Math.sin(Math.min(1, t / 230) * Math.PI);
      handX = 28 + reach * 48;
      handY = -72;
      lean = reach * 7;
    }
    if (this.pose === 'heavy') {
      if (t < 260) {
        handX = -22;
        handY = -93;
        lean = -9;
      } else {
        kick = 1;
        handX = 30;
        lean = 13;
      }
    }
    if (this.pose === 'block') {
      handX = 24;
      handY = -91;
      backX = 19;
      backY = -70;
    }
    if (this.pose === 'finisher') {
      handX = 62;
      handY = -45;
      lean = 16;
      kick = 0.6;
    }
    if (this.pose === 'dodge') {
      handX = 35;
      handY = -54;
      lean = 18;
    }
    const cy = crouch + bob;
    const line = (color: number, width: number, points: number[][]) => {
      g.lineStyle(width, color, 1);
      g.beginPath();
      points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokePath();
    };
    // Articulated limbs, broad trousers, baju silhouette, tengkolok and woven samping.
    line(0x172d2b, 14, [
      [-7, -43 + cy],
      [-16 - stride, -22 + cy],
      [-23 - stride, -4],
    ]);
    line(this.color, 16, [
      [8, -42 + cy],
      [17 + stride + kick * 30, -22 + cy - kick * 32],
      [24 + stride + kick * 45, -4 - kick * 50],
    ]);
    line(0xb2936e, 7, [
      [-23 - stride, -3],
      [-13 - stride, -3],
    ]);
    line(0xb2936e, 7, [
      [24 + stride + kick * 45, -3 - kick * 50],
      [34 + stride + kick * 45, -3 - kick * 50],
    ]);
    line(0x86745a, 9, [
      [lean - 10, -79 + cy],
      [backX - 6, -65 + cy],
      [backX, backY + cy],
    ]);
    g.fillStyle(this.color);
    g.fillPoints(
      [
        { x: lean - 15, y: -86 + cy },
        { x: lean + 15, y: -86 + cy },
        { x: 17, y: -43 + cy },
        { x: -15, y: -43 + cy },
      ],
      true,
    );
    g.fillStyle(0x9b805e);
    g.fillRect(lean - 4, -92 + cy, 9, 13);
    g.fillStyle(0xc0a17a);
    g.fillEllipse(lean + 1, -102 + cy, 22, 28);
    g.fillStyle(0x172c2a);
    g.fillPoints(
      [
        { x: lean - 12, y: -106 + cy },
        { x: lean - 13, y: -116 + cy },
        { x: lean + 1, y: -124 + cy },
        { x: lean + 6, y: -114 + cy },
        { x: lean + 13, y: -112 + cy },
        { x: lean + 12, y: -104 + cy },
      ],
      true,
    );
    g.lineStyle(2, this.sash, 0.8);
    g.lineBetween(lean - 10, -108 + cy, lean + 11, -108 + cy);
    g.fillStyle(0x273b31);
    g.fillRect(lean + 7, -102 + cy, 2, 2);
    g.fillStyle(this.sash);
    g.fillPoints(
      [
        { x: -17, y: -53 + cy },
        { x: 17, y: -53 + cy },
        { x: 21, y: -29 + cy },
        { x: -18, y: -33 + cy },
      ],
      true,
    );
    g.lineStyle(1, 0x293e33, 0.7);
    for (let i = 0; i < 4; i++) g.lineBetween(-15, -48 + i * 5 + cy, 17, -45 + i * 5 + cy);
    for (let i = -12; i < 18; i += 7) g.lineBetween(i, -52 + cy, i + 5, -32 + cy);
    line(this.color, 12, [
      [lean + 9, -81 + cy],
      [handX * 0.65, -69 + cy],
      [handX - 5, handY + cy],
    ]);
    line(0xc0a17a, 8, [
      [handX - 5, handY + cy],
      [handX + 3, handY + cy],
    ]);
    g.lineStyle(2, 0xc4b38a, 0.24);
    g.lineBetween(lean - 10, -83 + cy, -10, -57 + cy);
    g.lineBetween(lean + 13, -83 + cy, handX * 0.65, -71 + cy);
    if (this.pose === 'light' && t > 65 && t < 210) {
      g.lineStyle(3, 0xf1d5a4, 0.7);
      g.beginPath();
      g.arc(28, -69, 44, -1.3, 0.4);
      g.strokePath();
    }
    if (this.pose === 'heavy' && t > 260 && t < 430) {
      g.lineStyle(5, 0xe9be77, 0.65);
      g.beginPath();
      g.arc(9, -41, 69, -1, 0.6);
      g.strokePath();
    }
    if (hit) {
      g.fillStyle(0xffe7c5, 0.45);
      g.fillEllipse(0, -65, 35, 65);
    }
  }
  destroy() {
    this.g.destroy();
    this.shadow.destroy();
  }
}
