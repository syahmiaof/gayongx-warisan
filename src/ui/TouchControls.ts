import { touchInput } from '../systems/TouchInput';

export function mountTouchControls(root: HTMLElement) {
  const group = document.createElement('div');
  group.className = 'touch-controls';
  group.setAttribute('aria-label', 'Kawalan sentuh');
  group.innerHTML = `<div class="touch-move">
    <button data-keys="A,SHIFT" aria-label="Lari kiri"><svg viewBox="0 0 24 24"><path d="M15 5 8 12 15 19"/></svg></button>
    <button data-keys="D,SHIFT" aria-label="Lari kanan"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button>
    <button data-keys="E" aria-label="Interaksi">BICARA<small>E</small></button>
  </div><div class="touch-actions">
    <button data-keys="L" aria-label="Blok atau tangkis">TANGKIS<small>L · tahan / tap</small></button>
    <button data-keys="Q" aria-label="Elak">ELAK<small>Q</small></button>
    <button data-keys="F" aria-label="Jatuhan">JATUHAN<small>F</small></button>
    <button data-keys="SPACE" aria-label="Lompat">LOMPAT<small>Space</small></button>
    <button data-keys="J" class="touch-attack" aria-label="Serangan ringan">SERANG<small>J</small></button>
    <button data-keys="K" aria-label="Serangan berat">BERAT<small>K</small></button>
  </div>`;
  for (const button of group.querySelectorAll<HTMLButtonElement>('[data-keys]')) {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      touchInput.press(event.pointerId, button.dataset.keys!.split(','));
      button.classList.add('touch-held');
    });
    const release = (event: PointerEvent) => {
      touchInput.release(event.pointerId);
      button.classList.remove('touch-held');
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  }
  root.append(group);
}
