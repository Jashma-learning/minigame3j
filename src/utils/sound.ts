// Sound effects using Web Audio API
class SoundEffect {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Initialize on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.initialize();
      }
    }, { once: true });
  }

  private initialize() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.1; // Set volume to 10%
  }

  playTone(frequency: number, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(this.gainNode);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCardFlip() {
    this.playTone(440, 0.1); // A4 note, short duration
  }

  playMatch() {
    // Play a happy sound (ascending notes)
    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      [440, 550, 660].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.15), i * 150);
      });
    }
  }

  playNoMatch() {
    // Play a sad sound (descending notes)
    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      [330, 280].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.15), i * 150);
      });
    }
  }
}

export const soundEffect = new SoundEffect(); 