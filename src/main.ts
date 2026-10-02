import './style.css';
import { createGame } from './game/Game';
import type { VillageScene } from './scenes/VillageScene';
function fatal(message: string) {
  const panel = document.querySelector<HTMLElement>('#fatal')!;
  panel.hidden = false;
  panel.replaceChildren();
  const text = document.createElement('p');
  text.textContent = `Permainan tidak dapat dimuatkan. ${message}`;
  const retry = document.createElement('button');
  retry.textContent = 'Muat semula';
  retry.onclick = () => location.reload();
  panel.append(text, retry);
}
try {
  const game = createGame();
  if (import.meta.env.DEV) {
    Object.assign(window, {
      __WARISAN__: {
        game,
        snapshot: () => {
          const scene = game.scene.getScene('Village') as VillageScene;
          return game.scene.isActive('Village')
            ? scene.snapshot()
            : { scene: game.scene.getScenes(true).map((s) => s.scene.key)[0] };
        },
      },
    });
  }
  game.events.once('ready', () => {
    const parent = document.querySelector<HTMLElement>('#game')!;
    let frame = 0;
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => game.scale.refresh());
    });
    resize.observe(parent);
    game.events.once('destroy', () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
    });
    game.canvas.setAttribute(
      'aria-label',
      'GAYONGX: WARISAN. Keyboard atau kawalan sentuh landscape; butiran kawalan tersedia dalam menu.',
    );
    game.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      fatal('Paparan grafik terputus. Muat semula untuk mencuba semula.');
    });
  });
} catch (error) {
  fatal(
    error instanceof Error ? error.message : 'Sila gunakan pelayar moden dengan sokongan Canvas.',
  );
}
