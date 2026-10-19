/**
 * Web Audio API synthesized original signature jingle for Timbaktu.
 * Musical motif: "Tu tu tu tu... Timbaktu... tu tu tu tu... Timbaktu..."
 * Fully synthesized in-browser, zero external audio assets, works offline.
 */

class TimbaktuJinglePlayer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    const saved = localStorage.getItem('timbaktu_sound_enabled');
    this.isMuted = saved === 'false';
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isMuted = !enabled;
    localStorage.setItem('timbaktu_sound_enabled', String(enabled));
  }

  private initContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
      return null;
    }
  }

  /**
   * Plays a single cheerful marimba/woodwind bird chirp tone
   */
  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'triangle') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    // Subtle bird chirp pitch bend
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + duration * 0.3);
    osc.frequency.exponentialRampToValueAtTime(freq, startTime + duration);

    // Warm envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Signature motif:
   * "Tu tu tu tu... Timbaktu... tu tu tu tu... Timbaktu!"
   */
  public playSignatureJingle(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.05;

    // Frequencies (Hz)
    // G4 = 392, A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25
    const notes = [
      // Phrase 1: "Tu tu tu tu"
      { f: 392.00, t: now + 0.0, d: 0.12 },
      { f: 392.00, t: now + 0.18, d: 0.12 },
      { f: 440.00, t: now + 0.36, d: 0.12 },
      { f: 493.88, t: now + 0.54, d: 0.15 },

      // "Tim-bak-tu"
      { f: 523.25, t: now + 0.85, d: 0.20 }, // Tim
      { f: 392.00, t: now + 1.10, d: 0.18 }, // bak
      { f: 523.25, t: now + 1.35, d: 0.35 }, // tu!

      // Phrase 2: "Tu tu tu tu" (higher joyful register)
      { f: 523.25, t: now + 1.85, d: 0.12 },
      { f: 587.33, t: now + 2.03, d: 0.12 },
      { f: 659.25, t: now + 2.21, d: 0.12 },
      { f: 587.33, t: now + 2.39, d: 0.15 },

      // Final celebratory "Tim-bak-tu!"
      { f: 659.25, t: now + 2.65, d: 0.22 },
      { f: 523.25, t: now + 2.92, d: 0.20 },
      { f: 783.99, t: now + 3.18, d: 0.50 }, // High G5 flourish!
    ];

    notes.forEach(n => {
      this.playNote(n.f, n.t, n.d, 'triangle');
      // Layer a subtle soft sine tone an octave lower for body
      this.playNote(n.f * 0.5, n.t, n.d * 0.9, 'sine');
    });
  }
}

export const jinglePlayer = new TimbaktuJinglePlayer();
