/**
 * Main Application Coordinator
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Subsystems
  const stars = new Starfield('starsCanvas');
  const matrix = new MatrixRain('matrixCanvas');
  const fireworks = new FireworksEngine('fireworksCanvas');
  window.fireworks = fireworks;

  // Remove shimmer when each photo loads
  document.querySelectorAll('.polaroid-img-box img').forEach(img => {
    const box = img.closest('.polaroid-img-box');
    const markLoaded = () => { if (box) box.classList.add('loaded'); };
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markLoaded); // also hide on error
    }
  });

  // DOM Elements
  const giftScreen = document.getElementById('giftScreen');
  const matrixScreen = document.getElementById('matrixScreen');
  const bookScreen = document.getElementById('bookScreen');
  const openGiftBtn = document.getElementById('openGiftBtn');
  const giftBox = document.getElementById('giftBox');
  const skipSequenceBtn = document.getElementById('skipSequenceBtn');
  const sequenceWord = document.getElementById('sequenceWord');

  // Music HUD
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      window.soundEngine.toggleBgMusic();
    });
  }

  // Lightbox
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');

  document.querySelectorAll('.polaroid-image-wrapper img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxModal.classList.add('active');
      }
    });
  });

  if (lightboxModal) {
    lightboxModal.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  // Floating Hearts on Click
  window.addEventListener('click', (e) => {
    // Avoid triggering if clicking inputs or settings
    if (!e.target.closest('#settingsModal') && !e.target.closest('button') && !e.target.closest('input')) {
      fireworks.spawnHeart(e.clientX, e.clientY);
    }
  });

  // Flow Step 1: Open Gift Box
  const triggerOpenGift = () => {
    // Play Background Song "What If I Call"
    window.soundEngine.playBgMusic();
    window.soundEngine.playChime();
    fireworks.triggerCelebration(5);

    // Transition from Gift Screen to Matrix Screen
    giftScreen.classList.add('hidden');
    matrixScreen.classList.remove('hidden');
    matrix.start();

    // Start sequence words
    const seq = new SequencePresentation('sequenceWord', () => {
      goToBookScreen();
    });
    seq.start();

    if (skipSequenceBtn) {
      skipSequenceBtn.addEventListener('click', () => {
        seq.skip();
      });
    }
  };

  if (openGiftBtn) openGiftBtn.addEventListener('click', triggerOpenGift);
  if (giftBox) giftBox.addEventListener('click', triggerOpenGift);

  // Flow Step 2: Transition into 3D Book Screen
  let bookInitialized = false;
  const goToBookScreen = () => {
    matrix.stop();
    matrixScreen.classList.add('hidden');
    bookScreen.classList.remove('hidden');

    if (!bookInitialized) {
      window.flipBook = new FlipBook('bookWrapper');
      bookInitialized = true;
      fireworks.triggerCelebration(6);
    }
  };

  // Top Action: Fullscreen Toggle
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Top Action: Fireworks manual trigger
  const fireworkActionBtn = document.getElementById('fireworkActionBtn');
  if (fireworkActionBtn) {
    fireworkActionBtn.addEventListener('click', () => {
      fireworks.triggerCelebration(10);
    });
  }

  // Settings & Media Customizer
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const recipientNameInput = document.getElementById('recipientNameInput');
  const coverRecipientEl = document.getElementById('coverRecipient');

  // Load saved recipient name
  const savedName = localStorage.getItem('hbd_recipient_name');
  if (savedName) {
    if (recipientNameInput) recipientNameInput.value = savedName;
    if (coverRecipientEl) coverRecipientEl.textContent = savedName;
  }

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('active');
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('active');
    });
  }

  if (saveSettingsBtn && settingsModal) {
    saveSettingsBtn.addEventListener('click', () => {
      if (recipientNameInput && coverRecipientEl) {
        const newName = recipientNameInput.value.trim() || 'My Favorite Person';
        coverRecipientEl.textContent = newName;
        localStorage.setItem('hbd_recipient_name', newName);
      }
      settingsModal.classList.remove('active');
    });
  }

  // Theme selection for Matrix
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      matrix.setTheme(theme);
    });
  });

  // Real-time Photo Uploader (allows user to select their 11 photos directly in browser!)
  const photoFileInput = document.getElementById('photoFileInput');
  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const polaroidImgs = document.querySelectorAll('.polaroid-image-wrapper img');
      files.slice(0, 11).forEach((file, idx) => {
        if (polaroidImgs[idx]) {
          const reader = new FileReader();
          reader.onload = (event) => {
            polaroidImgs[idx].src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
      alert(`Berhasil memuat ${Math.min(files.length, 11)} foto ke dalam buku kenangan!`);
    });
  }

  // Real-time Video Uploader (allows user to select their 1 video)
  const videoFileInput = document.getElementById('videoFileInput');
  const memoryVideo = document.getElementById('memoryVideo');
  if (videoFileInput && memoryVideo) {
    videoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      memoryVideo.src = url;
      memoryVideo.load();
      alert('Berhasil memuat video kenangan Anda!');
    });
  }

  // Real-time Custom MP3 Uploader (for "What If I Call" or custom audio file)
  const audioFileInput = document.getElementById('audioFileInput');
  const bgAudio = document.getElementById('bgAudio');
  if (audioFileInput && bgAudio) {
    audioFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      bgAudio.src = url;
      bgAudio.load();
      window.soundEngine.playBgMusic();
      alert('Lagu latar berhasil diperbarui!');
    });
  }
});
