/**
 * ============================================================
 * AUDIO MANAGER v2.0
 * ============================================================
 * 
 * Управление звуками и музыкой в игре.
 * Использует Web Audio API для генерации звуков.
 * 
 * ============================================================
 */

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  sfxEnabled: true,
  musicEnabled: true,
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    this.loadSettings();
  }

  private initContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('gameAudioSettings');
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load audio settings');
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('gameAudioSettings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings');
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Update music volume if playing
    if (this.musicGain && this.isMusicPlaying) {
      const volume = this.settings.musicEnabled 
        ? this.settings.masterVolume * this.settings.musicVolume * 0.1
        : 0;
      this.musicGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  private getEffectiveVolume(type: 'sfx' | 'music'): number {
    const baseVolume = type === 'sfx' ? this.settings.sfxVolume : this.settings.musicVolume;
    const enabled = type === 'sfx' ? this.settings.sfxEnabled : this.settings.musicEnabled;
    return enabled ? this.settings.masterVolume * baseVolume : 0;
  }

  // ============================================================
  // SOUND EFFECTS
  // ============================================================

  playShoot(towerType: 'sniper' | 'knight' | 'laser' | 'fountain'): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.3;
    
    switch (towerType) {
      case 'sniper':
        this.playTone(800, 0.05, 'sine', volume);
        break;
      case 'knight':
        this.playTone(200, 0.08, 'square', volume * 0.7);
        break;
      case 'laser':
        this.playTone(1200, 0.1, 'sawtooth', volume * 0.4);
        break;
      case 'fountain':
        this.playNoise(0.1, volume * 0.5);
        break;
    }
  }

  playEnemyHit(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.2;
    this.playTone(400, 0.05, 'triangle', volume);
  }

  playEnemyDeath(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.4;
    this.playDescendingTone(600, 200, 0.15, volume);
  }

  playTowerPlace(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.5;
    this.playTone(523, 0.1, 'sine', volume);
    setTimeout(() => this.playTone(659, 0.1, 'sine', volume), 50);
  }

  playTowerUpgrade(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.5;
    this.playTone(523, 0.08, 'sine', volume);
    setTimeout(() => this.playTone(659, 0.08, 'sine', volume), 60);
    setTimeout(() => this.playTone(784, 0.12, 'sine', volume), 120);
  }

  playTowerSell(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.4;
    this.playDescendingTone(600, 300, 0.2, volume);
  }

  playWaveStart(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.6;
    this.playTone(440, 0.1, 'square', volume);
    setTimeout(() => this.playTone(554, 0.1, 'square', volume), 100);
    setTimeout(() => this.playTone(659, 0.15, 'square', volume), 200);
  }

  playWaveComplete(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.6;
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', volume), i * 80);
    });
  }

  playVictory(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.7;
    const melody = [523, 659, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', volume), i * 150);
    });
  }

  playDefeat(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.7;
    this.playDescendingTone(400, 100, 0.5, volume);
  }

  playLifeLost(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.5;
    this.playDescendingTone(300, 150, 0.2, volume);
  }

  playClick(): void {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    
    const volume = this.getEffectiveVolume('sfx') * 0.3;
    this.playTone(600, 0.03, 'sine', volume);
  }

  // ============================================================
  // BACKGROUND MUSIC (Procedural)
  // ============================================================

  startMusic(): void {
    if (!this.settings.musicEnabled || this.isMusicPlaying) return;
    this.initContext();
    
    if (!this.audioContext) return;

    this.isMusicPlaying = true;
    this.playAmbientLoop();
  }

  stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicOscillator) {
      try {
        this.musicOscillator.stop();
      } catch (e) {}
      this.musicOscillator = null;
    }
    if (this.musicGain) {
      this.musicGain = null;
    }
  }

  private playAmbientLoop(): void {
    if (!this.audioContext || !this.isMusicPlaying) return;

    const volume = this.getEffectiveVolume('music') * 0.1;
    
    // Create a simple ambient drone
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    this.musicOscillator = osc;
    this.musicGain = gain;
    
    osc.start();

    // Modulate frequency for atmosphere
    const modulateMusic = () => {
      if (!this.isMusicPlaying || !this.audioContext) return;
      
      const baseFreq = 110;
      const notes = [1, 1.5, 2, 1.33]; // Root, fifth, octave, fourth
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      osc.frequency.linearRampToValueAtTime(
        baseFreq * note,
        this.audioContext.currentTime + 4
      );
      
      setTimeout(modulateMusic, 4000);
    };
    
    modulateMusic();
  }

  toggleMusic(): void {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playDescendingTone(
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playNoise(duration: number, volume: number): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(this.audioContext.currentTime);
  }
}

// Singleton instance
export const audioManager = new AudioManager();
