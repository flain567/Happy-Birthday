/**
 * Audio Controller & Sound Synthesizer via Web Audio API
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgAudio = document.getElementById('bgAudio');
    this.isPlaying = false;
    this.wasPlayingBeforeVideo = false;
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBgMusic() {
    if (!this.bgAudio) return;
    this.ensureContext();
    this.bgAudio.play().then(() => {
      this.isPlaying = true;
      this.updateHudState(true);
    }).catch(err => {
      console.warn("Autoplay blocked or audio failed, waiting for user interaction:", err);
    });
  }

  pauseBgMusic() {
    if (!this.bgAudio) return;
    this.bgAudio.pause();
    this.isPlaying = false;
    this.updateHudState(false);
  }

  toggleBgMusic() {
    if (this.isPlaying) {
      this.pauseBgMusic();
    } else {
      this.playBgMusic();
    }
  }

  handleVideoPlay() {
    if (this.isPlaying) {
      this.wasPlayingBeforeVideo = true;
      this.pauseBgMusic();
    }
  }

  handleVideoPause() {
    if (this.wasPlayingBeforeVideo) {
      this.playBgMusic();
      this.wasPlayingBeforeVideo = false;
    }
  }

  updateHudState(playing) {
    const vinyl = document.getElementById('vinylDisc');
    const toggleBtn = document.getElementById('musicToggleBtn');
    if (vinyl) {
      if (playing) vinyl.classList.add('playing');
      else vinyl.classList.remove('playing');
    }
    if (toggleBtn) {
      toggleBtn.innerHTML = playing ? '⏸' : '▶';
    }
  }

  // Realistic Paper Page Flip Sound using Web Audio API filtered noise
  playPageFlipSound() {
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {
      // Ignore audio synthesis errors
    }
  }

  // Gentle Blow candle sound
  playBlowSound() {
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (e) {}
  }

  // Celebration Chime
  playChime() {
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.8);
        } catch(e) {}
      }, index * 90);
    });
  }
}

window.soundEngine = new SoundEngine();
