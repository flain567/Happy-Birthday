/**
 * Matrix Neon Rain & Sequence Word Presentation
 */
class MatrixRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.fontSize = 18;
    this.columns = 0;
    this.drops = [];
    this.active = false;
    this.theme = 'pink'; // 'pink', 'cyan', 'purple', 'gold'
    this.characters = 'HAPPYBIRTHDAY0123456789❤★🎂✨LOVE';

    this.colorPalettes = {
      pink: { primary: '#ff4d8d', secondary: '#ff85b3', glow: 'rgba(255, 77, 141, 0.8)' },
      cyan: { primary: '#00f2fe', secondary: '#4facfe', glow: 'rgba(0, 242, 254, 0.8)' },
      purple: { primary: '#c471ed', secondary: '#f64f59', glow: 'rgba(196, 113, 237, 0.8)' },
      gold: { primary: '#ffd166', secondary: '#ffbe0b', glow: 'rgba(255, 209, 102, 0.8)' }
    };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
  }

  setTheme(themeName) {
    if (this.colorPalettes[themeName]) {
      this.theme = themeName;
    }
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.width / this.fontSize);
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -50);
    }
  }

  start() {
    this.active = true;
    this.canvas.style.opacity = '1';
    requestAnimationFrame(this.animate);
  }

  stop() {
    this.active = false;
    this.canvas.style.opacity = '0';
  }

  animate() {
    if (!this.active) return;

    // Dark semi-transparent fade for motion blur
    this.ctx.fillStyle = 'rgba(10, 6, 20, 0.12)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const colors = this.colorPalettes[this.theme];
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Glow effect for lead character
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = colors.glow;
      this.ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : colors.primary;

      this.ctx.fillText(text, x, y);

      if (y > this.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }

    requestAnimationFrame(this.animate);
  }
}

/**
 * Controller for Sequence Words display
 */
class SequencePresentation {
  constructor(wordElementId, onComplete) {
    this.wordEl = document.getElementById(wordElementId);
    this.onComplete = onComplete;
    this.phrases = [
      "CHAPTER 21",
      "TWENTY-ONE YEARS OF YOU ✨",
      "EVERY MEMORY IS A TREASURE",
      "WELCOME TO YOUR PERSONAL ARCHIVE",
      "OPENING YOUR MEMORY BOOK 📖"
    ];
    this.currentIndex = 0;
    this.timeout = null;
  }

  start() {
    this.currentIndex = 0;
    this.showNextWord();
  }

  showNextWord() {
    if (this.currentIndex >= this.phrases.length) {
      if (this.onComplete) this.onComplete();
      return;
    }

    if (!this.wordEl) return;
    this.wordEl.classList.remove('visible');

    setTimeout(() => {
      this.wordEl.textContent = this.phrases[this.currentIndex];
      this.wordEl.classList.add('visible');
      this.currentIndex++;
      this.timeout = setTimeout(() => this.showNextWord(), 2000);
    }, 400);
  }

  skip() {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.onComplete) this.onComplete();
  }
}

window.MatrixRain = MatrixRain;
window.SequencePresentation = SequencePresentation;
