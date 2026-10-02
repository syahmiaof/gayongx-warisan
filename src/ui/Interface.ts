import { DISCLAIMER, type Line } from '../data/story';
import { audio } from '../systems/AudioSystem';
import { touchInput } from '../systems/TouchInput';
import { mountTouchControls } from './TouchControls';
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export class Interface {
  root = document.querySelector<HTMLDivElement>('#ui')!;
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private dialogLines: Line[] = [];
  private dialogIndex = 0;
  private afterDialog?: () => void;
  private lastObjective = '';
  private noticeUntil = 0;
  get talking() {
    return this.dialogLines.length > 0;
  }
  clear() {
    touchInput.reset();
    this.root.innerHTML = '';
    this.root.className = '';
    this.dialogLines = [];
    this.dialogIndex = 0;
    this.afterDialog = undefined;
    this.lastObjective = '';
  }
  private bind(id: string, fn: () => void) {
    this.root.querySelector<HTMLButtonElement>(`#${id}`)?.addEventListener('click', () => {
      audio.play('ui');
      fn();
    });
  }
  menu(start: () => void) {
    this.clear();
    this.root.className = 'menu';
    this.root.innerHTML = `<div class="edge-label">SEBUAH KISAH TENTANG AMANAH</div><main class="menu-content"><div class="crest"><img src="/branding/logo.png" alt="Logo PSSGM" /></div><h1>GAYONGX<span>WARISAN</span></h1><p class="menu-story">Ilmu datang bersama amanah.</p><nav aria-label="Menu utama"><button id="start" class="menu-action primary"><span>Mula permainan</span><svg viewBox="0 0 32 16"><path d="M1 8H28 M21 1 28 8 21 15"/></svg></button><button id="controls" class="menu-action">Kawalan<span class="button-note">Keyboard / sentuh</span></button><button id="about" class="menu-action">Tentang projek<span class="button-note">Sebuah dramatisasi</span></button></nav><div class="menu-meta"><span>PULAU SUDONG · 1942</span><span>DEMO BAB PERTAMA</span></div></main><div class="menu-caption">Di antara ombak dan daratan,<br>sebuah warisan dipertahankan.</div><footer><span>FIKSYEN SEJARAH · PENGEMBARAAN SILAT</span><button id="sound">${audio.muted ? 'Bunyi: tutup' : 'Bunyi: hidup'}</button></footer>`;
    this.bind('start', () => {
      void audio.unlock();
      start();
    });
    this.bind('controls', () => this.controls(() => this.menu(start)));
    this.bind('about', () => this.about(() => this.menu(start)));
    this.bind('sound', () => {
      void audio.unlock();
      audio.toggle();
      this.menu(start);
    });
  }
  controls(back: () => void, target: Element = this.root) {
    target.innerHTML = `<section class="panel-screen"><div class="panel controls-panel"><h2>Kuasai langkah.</h2><p>Jaga jarak. Baca gerak. Bertindak apabila perlu.</p><div class="key-grid">${[
      ['A / D', 'Bergerak'],
      ['Shift', 'Berlari'],
      ['Space', 'Lompat'],
      ['J', 'Serangan ringan · kombo 3 hit'],
      ['K', 'Serangan berat · pecah blok'],
      ['L', 'Tahan: blok · tekan tepat masa: tangkis'],
      ['Q', 'Elak · kebal seketika'],
      ['F', 'Jatuhan · musuh bawah 30% tenaga'],
      ['E / Enter', 'Berinteraksi / sambung dialog'],
      ['Esc', 'Jeda permainan'],
    ]
      .map(([k, v]) => `<div><kbd>${k}</kbd><span>${v}</span></div>`)
      .join(
        '',
      )}</div><p class="small">Mobile: main landscape. Tahan anak panah untuk berlari; butang berlabel menggunakan tindakan yang sama. Tanda putih “TANGKIS!” menandakan peluang parry. Hadap penyerang. Elak sebelum pukulan tiba.</p><button class="solid" id="back">Kembali</button></div></section>`;
    this.bind('back', back);
  }
  about(back: () => void) {
    this.root.innerHTML = `<section class="panel-screen"><div class="panel about-panel"><h2>Sebuah warisan.<br>Sebuah interpretasi.</h2><p>${DISCLAIMER}</p><p>Arif, penceroboh, dialog dan pertembungan dalam demo ini ialah rekaan. Watak Meor Abdul Rahman ditampilkan sebagai inspirasi sejarah; kata-kata dalam permainan bukan petikan yang disahkan.</p><p>Tarikh 17 Februari 1942 ialah bingkai naratif demo, bukan pengesahan bahawa peristiwa permainan pernah berlaku. Projek bebas; tiada dakwaan sokongan rasmi mana-mana persatuan.</p><p class="small">Dibina dengan Phaser 3 · Seni prosedural asli · Audio sintesis<br>Demo satu pemain · Keyboard / sentuh · Sasaran pengalaman pertama 5–10 minit</p><button class="solid" id="back">Kembali</button></div></section>`;
    this.bind('back', back);
  }
  cinematic(title: string, subtitle: string, body: string, action: string, next: () => void) {
    this.clear();
    this.root.className = 'cinematic';
    this.root.innerHTML = `<div class="letterbox top"></div><section class="cinema-copy"><p class="cinema-place">${escape(subtitle)}</p><h2>${title}</h2>${body ? `<p class="cinema-body">${escape(body)}</p>` : ''}</section><button id="next" class="cinema-next">${escape(action)} <kbd>Enter</kbd></button><div class="letterbox bottom"></div>`;
    this.bind('next', next);
  }
  hud(pause: () => void) {
    this.clear();
    this.root.className = 'playing';
    this.root.innerHTML = `<header class="hud"><div class="player-hud"><span class="player-name">ARIF <small>ANAK PESISIR</small></span><div class="health-track" role="meter" aria-label="Tenaga Arif" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div id="health"></div></div><span class="health-number" id="hp">100 / 100</span></div><div class="objective"><span id="chapter">PULAU SUDONG</span><p id="objective"></p></div><button id="pause" aria-label="Jeda permainan"><svg viewBox="0 0 24 24"><path d="M8 5V19 M16 5V19"/></svg></button></header><div id="lesson" class="lesson" hidden></div><div id="notice" aria-live="polite"></div><div id="interaction"></div><div class="bottom-hud"><span id="hints"><kbd>A D</kbd> Gerak <kbd>Shift</kbd> Lari <kbd>Space</kbd> Lompat <kbd>E</kbd> Interaksi</span><span class="chapter-counter" id="progress">01 / 04</span></div><div id="dialogue-slot"></div><div id="overlay-slot"></div><div id="debug" hidden></div>`;
    this.bind('pause', pause);
    mountTouchControls(this.root);
  }
  objective(chapter: string, text: string, progress: string) {
    if (text === this.lastObjective) return;
    this.lastObjective = text;
    this.text('chapter', chapter);
    this.text('objective', text);
    this.text('progress', progress);
    const el = this.root.querySelector('#objective');
    if (!this.reduced)
      el?.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 450 },
      );
  }
  lesson(title: string, text: string, key: string) {
    const el = this.root.querySelector<HTMLDivElement>('#lesson');
    if (el) {
      el.hidden = false;
      el.innerHTML = `<span class="lesson-key">${escape(key)}</span><h3>${escape(title)}</h3><p>${escape(text)}</p>`;
    }
  }
  hideLesson() {
    const el = this.root.querySelector<HTMLElement>('#lesson');
    if (el) el.hidden = true;
  }
  combatHints() {
    const el = this.root.querySelector('#hints');
    if (el)
      el.innerHTML =
        '<kbd>J</kbd> Serang <kbd>K</kbd> Berat <kbd>L</kbd> Blok / tangkis <kbd>Q</kbd> Elak <kbd>F</kbd> Jatuhan';
  }
  health(value: number) {
    const el = this.root.querySelector<HTMLElement>('#health');
    if (el) el.style.transform = `scaleX(${value / 100})`;
    this.root.querySelector('[role=meter]')?.setAttribute('aria-valuenow', String(value));
    this.text('hp', `${value} / 100`);
  }
  interaction(text: string) {
    this.text('interaction', text);
  }
  notice(message: string) {
    this.text('notice', message);
    this.noticeUntil = performance.now() + 1800;
  }
  tick() {
    if (this.noticeUntil && performance.now() > this.noticeUntil) {
      this.text('notice', '');
      this.noticeUntil = 0;
    }
  }
  dialog(lines: Line[], done: () => void) {
    touchInput.reset();
    this.dialogLines = lines;
    this.dialogIndex = 0;
    this.afterDialog = done;
    this.drawDialog();
  }
  nextDialog() {
    if (!this.talking) return;
    this.dialogIndex++;
    if (this.dialogIndex >= this.dialogLines.length) {
      this.dialogLines = [];
      this.root.querySelector('#dialogue-slot')?.replaceChildren();
      const cb = this.afterDialog;
      this.afterDialog = undefined;
      cb?.();
    } else this.drawDialog();
  }
  private drawDialog() {
    const line = this.dialogLines[this.dialogIndex],
      slot = this.root.querySelector('#dialogue-slot');
    if (!slot) return;
    slot.innerHTML = `<div class="dialogue-shade"></div><section class="dialogue"><div><span class="speaker">${escape(line.name)}</span><p>${escape(line.text)}</p><small>DIALOG DIDRAMATISASIKAN</small></div><button id="continue" class="text-button">Sambung <kbd>E / Enter</kbd></button></section>`;
    this.bind('continue', () => this.nextDialog());
  }
  pause(resume: () => void, restart: () => void, menu: () => void) {
    const slot = this.root.querySelector('#overlay-slot');
    if (!slot) return;
    const show = () => {
      const currentSlot = this.root.querySelector('#overlay-slot');
      if (!currentSlot) return;
      currentSlot.innerHTML = `<section class="panel-screen"><div class="panel pause-panel"><span class="pause-mark">GAYONGX / WARISAN</span><h2>Tarik nafas.</h2><p>Langkah seterusnya menanti.</p><button id="resume" class="solid">Sambung</button><button id="restart" class="plain">Mula semula bab</button><button id="pause-controls" class="plain">Kawalan</button><button id="pause-menu" class="plain">Menu utama</button><div class="settings"><button id="pause-sound">Bunyi: ${audio.muted ? 'tutup' : 'hidup'}</button><button id="motion">Gerakan: ${this.reduced ? 'dikurangkan' : 'penuh'}</button></div></div></section>`;
      this.bind('resume', resume);
      this.bind('restart', restart);
      this.bind('pause-menu', menu);
      this.bind('pause-sound', () => {
        audio.toggle();
        show();
      });
      this.bind('motion', () => {
        this.reduced = !this.reduced;
        document.documentElement.classList.toggle('reduce-motion', this.reduced);
        show();
      });
      this.bind('pause-controls', () => this.controls(show, currentSlot));
    };
    show();
  }
  closeOverlay() {
    this.root.querySelector('#overlay-slot')?.replaceChildren();
  }
  defeat(retry: () => void, menu: () => void) {
    const el = this.root.querySelector('#overlay-slot');
    if (el)
      el.innerHTML =
        '<section class="panel-screen"><div class="panel pause-panel"><h2>Bangkit semula.</h2><p>Perjalanan belum berakhir. Cuba baca gerak lawan sebelum menyerang.</p><button class="solid" id="retry">Cuba semula bab</button><button class="plain" id="defeat-menu">Menu utama</button></div></section>';
    this.bind('retry', retry);
    this.bind('defeat-menu', menu);
  }
  debug(text: string, visible: boolean) {
    const el = this.root.querySelector<HTMLElement>('#debug');
    if (el) {
      el.hidden = !visible;
      el.textContent = text;
    }
  }
  private text(id: string, text: string) {
    const el = this.root.querySelector(`#${id}`);
    if (el && el.textContent !== text) el.textContent = text;
  }
}
export const ui = new Interface();
