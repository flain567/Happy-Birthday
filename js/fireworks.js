/**
 * Fireworks & Floating Hearts Particle Engine
 */
class FireworksEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.hearts = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  // Create a firework burst at (x, y)
  createBurst(x, y, count = 60) {
    const hues = [0, 45, 120, 180, 280, 320];
    const baseHue = hues[Math.floor(Math.random() * hues.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: `hsl(${baseHue + (Math.random() - 0.5) * 40}, 100%, ${Math.random() * 30 + 55}%)`,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        gravity: 0.08,
        radius: Math.random() * 2.5 + 1.5
      });
    }
  }

  // Multi-rocket celebration barrage
  triggerCelebration(burstCount = 8) {
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        const x = Math.random() * (this.width * 0.8) + (this.width * 0.1);
        const y = Math.random() * (this.height * 0.5) + (this.height * 0.15);
        this.createBurst(x, y, 70);
      }, i * 350);
    }
  }

  // Spawn floating heart particle at (x, y)
  spawnHeart(x, y) {
    const emojis = ['❤️', '💖', '✨', '🌸', '💕', '🎂'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    this.hearts.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 2.5 + 2),
      alpha: 1,
      size: Math.random() * 12 + 18,
      rotation: (Math.random() - 0.5) * 0.4,
      symbol: emoji
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw fireworks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update & draw floating hearts
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.x += h.vx;
      h.y += h.vy;
      h.alpha -= 0.015;

      if (h.alpha <= 0) {
        this.hearts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = h.alpha;
      this.ctx.font = `${h.size}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(h.symbol, h.x, h.y);
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

window.FireworksEngine = FireworksEngine;
