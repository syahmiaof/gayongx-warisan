import Phaser from 'phaser';
import { touchInput } from './TouchInput';
export class Input {
  usingTouch = false;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private pending = new Set<string>();
  constructor(scene: Phaser.Scene) {
    if (!scene.input.keyboard) throw new Error('Keyboard input unavailable');
    this.keys = scene.input.keyboard.addKeys(
      'A,D,W,S,SPACE,SHIFT,J,K,L,Q,E,F,ESC,ENTER' +
        (import.meta.env.DEV ? ',F1,ONE,TWO,THREE,FOUR' : ''),
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    Object.entries(this.keys).forEach(([name, key]) =>
      key.on('down', () => {
        this.usingTouch = false;
        this.pending.add(name);
      }),
    );
    const unsubscribe = touchInput.subscribe((key) => {
      this.usingTouch = true;
      this.pending.add(key);
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe();
      touchInput.reset();
    });
  }
  down(key: string) {
    return (this.keys[key]?.isDown ?? false) || touchInput.down(key);
  }
  pressed(key: string) {
    return this.pending.delete(key);
  }
  reset() {
    touchInput.reset();
    this.pending.clear();
    Object.values(this.keys).forEach((key) => key.reset());
  }
}
