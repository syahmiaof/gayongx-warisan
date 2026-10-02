import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { IntroScene } from '../scenes/IntroScene';
import { VillageScene } from '../scenes/VillageScene';
import { EndingScene } from '../scenes/EndingScene';
export function createGame() {
  return new Phaser.Game({
    type: Phaser.CANVAS,
    parent: 'game',
    width: 1280,
    height: 720,
    backgroundColor: '#0b1717',
    antialias: true,
    fps: { smoothStep: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { keyboard: true },
    render: { roundPixels: false },
    scene: [BootScene, MainMenuScene, IntroScene, VillageScene, EndingScene],
    audio: { noAudio: true },
  });
}
