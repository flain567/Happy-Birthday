/**
 * 3D Interactive Flip-Book Engine
 * Handles 11 Photos, 1 Video, Wishes, and Interactive Cake Candle Blowing
 */
class FlipBook {
  constructor(bookWrapperId, options = {}) {
    this.wrapper = document.getElementById(bookWrapperId);
    if (!this.wrapper) return;
    this.pages = Array.from(this.wrapper.querySelectorAll('.book-page'));
    this.currentPage = 0; // Index of next page to flip (0 to pages.length)
    this.totalPages = this.pages.length;
    this.soundEngine = window.soundEngine;
    this.videoElement = document.getElementById('memoryVideo');
    this.prevBtn = document.getElementById('prevPageBtn');
    this.nextBtn = document.getElementById('nextPageBtn');
    this.pageIndicator = document.getElementById('pageIndicator');
    
    this.initStacking();
    this.bindEvents();
    this.updateControls();
    this.initCandle();
    this.initVideoHooks();
  }

  initStacking() {
    this.pages.forEach((page, index) => {
      page.style.zIndex = this.totalPages - index;
      page.dataset.index = index;
    });
  }

  bindEvents() {
    // Click on page to flip
    this.pages.forEach((page, index) => {
      page.addEventListener('click', (e) => {
        // If clicking inside video controls, inputs or lightbox triggers, don't flip
        if (e.target.closest('video') || e.target.closest('button') || e.target.closest('.polaroid-image-wrapper')) {
          return;
        }

        if (page.classList.contains('flipped')) {
          this.flipPrev();
        } else {
          this.flipNext();
        }
      });
    });

    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.flipPrev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.flipNext());

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.flipNext();
      } else if (e.key === 'ArrowLeft') {
        this.flipPrev();
      }
    });

    // Touch Swipe gestures for smartphones
    let touchStartX = 0;
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.wrapper.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (diffX < -50) {
        this.flipNext();
      } else if (diffX > 50) {
        this.flipPrev();
      }
    }, { passive: true });
  }

  flipNext() {
    if (this.currentPage >= this.totalPages) return;

    const page = this.pages[this.currentPage];
    page.classList.add('flipped');
    page.style.zIndex = this.currentPage + 1;

    if (this.soundEngine) this.soundEngine.playPageFlipSound();

    this.currentPage++;
    this.updateBookPosition();
    this.updateControls();
  }

  flipPrev() {
    if (this.currentPage <= 0) return;

    this.currentPage--;
    const page = this.pages[this.currentPage];
    page.classList.remove('flipped');
    page.style.zIndex = this.totalPages - this.currentPage;

    if (this.soundEngine) this.soundEngine.playPageFlipSound();

    this.updateBookPosition();
    this.updateControls();
  }

  updateBookPosition() {
    if (this.currentPage === 0) {
      this.wrapper.classList.remove('is-open', 'is-last');
    } else if (this.currentPage === this.totalPages) {
      this.wrapper.classList.remove('is-open');
      this.wrapper.classList.add('is-last');
    } else {
      this.wrapper.classList.add('is-open');
      this.wrapper.classList.remove('is-last');
    }
  }

  updateControls() {
    if (this.prevBtn) this.prevBtn.disabled = this.currentPage === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentPage === this.totalPages;
    if (this.pageIndicator) {
      this.pageIndicator.textContent = `${this.currentPage} / ${this.totalPages}`;
    }
  }

  initCandle() {
    const blowBtn = document.getElementById('blowCandleBtn');
    const flame = document.getElementById('cakeFlame');
    const cakeContainer = document.getElementById('cakeContainer');

    const blowAction = () => {
      if (!flame || flame.classList.contains('extinguished')) return;

      flame.classList.add('extinguished');
      if (this.soundEngine) {
        this.soundEngine.playBlowSound();
        setTimeout(() => this.soundEngine.playChime(), 350);
      }

      // Add smoke puff
      if (cakeContainer) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-puff';
        cakeContainer.appendChild(smoke);
        setTimeout(() => smoke.remove(), 1600);
      }

      // Trigger grand fireworks & hearts!
      if (window.fireworks) {
        window.fireworks.triggerCelebration(14);
      }

      if (blowBtn) {
        blowBtn.textContent = '🎉 Make a Wish Granted!';
        blowBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      }
    };

    if (blowBtn) blowBtn.addEventListener('click', blowAction);
    if (flame) flame.addEventListener('click', blowAction);
  }

  initVideoHooks() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('play', () => {
      if (this.soundEngine) this.soundEngine.handleVideoPlay();
    });

    this.videoElement.addEventListener('pause', () => {
      if (this.soundEngine) this.soundEngine.handleVideoPause();
    });

    this.videoElement.addEventListener('ended', () => {
      if (this.soundEngine) this.soundEngine.handleVideoPause();
    });
  }
}

window.FlipBook = FlipBook;
