type Cue = 'light' | 'heavy' | 'parry' | 'block' | 'step' | 'gong' | 'ui' | 'hurt';
class AudioSystem {
  private context?: AudioContext;
  private master?: GainNode;
  private ambient?: AudioBufferSourceNode;
  muted = false;
  suspended = false;
  async unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0.24;
        this.master.connect(this.context.destination);
        const buffer = this.context.createBuffer(
            1,
            this.context.sampleRate * 6,
            this.context.sampleRate,
          ),
          data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + Math.random() * 0.04 - 0.02) / 1.02;
          data[i] = last * (0.5 + 0.35 * Math.sin((i / data.length) * Math.PI * 2));
        }
        this.ambient = this.context.createBufferSource();
        this.ambient.buffer = buffer;
        this.ambient.loop = true;
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 700;
        this.ambient.connect(filter);
        filter.connect(this.master);
        this.ambient.start();
      }
      await this.context.resume();
      this.apply();
    } catch {
      /* Audio is optional; gameplay remains available when browser audio is blocked. */
    }
  }
  toggle() {
    this.muted = !this.muted;
    this.apply();
  }
  pause(value: boolean) {
    this.suspended = value;
    this.apply();
  }
  private apply() {
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        this.muted || this.suspended ? 0 : 0.24,
        this.context.currentTime,
        0.08,
      );
  }
  play(cue: Cue) {
    if (!this.context || !this.master || this.muted || this.suspended) return;
    const ctx = this.context,
      now = ctx.currentTime,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    const tones: Record<Cue, [number, number, number]> = {
      light: [145, 0.1, 0.45],
      heavy: [72, 0.23, 0.8],
      parry: [900, 0.24, 0.36],
      block: [210, 0.12, 0.4],
      step: [65, 0.045, 0.12],
      gong: [105, 1.5, 0.6],
      ui: [480, 0.08, 0.15],
      hurt: [95, 0.16, 0.5],
    };
    const [frequency, duration, volume] = tones[cue];
    osc.type = cue === 'parry' || cue === 'ui' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.35, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(now + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
export const audio = new AudioSystem();
