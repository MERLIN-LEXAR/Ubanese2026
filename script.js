/* ===========================
   COUNTDOWN TIMER + FULLSCREEN WEDDING DAY SWAP
   =========================== */
(function initCountdown() {
  const TARGET_TIME = new Date('October 31, 2026 11:00:00 GMT+01:00').getTime();
  const WEDDING_DAY = new Date('October 31, 2026 00:00:00 GMT+01:00').getTime();

  const els = {
    days:  document.getElementById('timer-days'),
    hours: document.getElementById('timer-hours'),
    mins:  document.getElementById('timer-mins'),
    secs:  document.getElementById('timer-secs'),
  };

  const mainSite = document.getElementById('main-site');
  const weddingScreen = document.getElementById('wedding-day-screen');

  if (!mainSite || !weddingScreen) return;

  let hasCelebrated = false;

  function showWeddingScreen() {
    mainSite.classList.add('hidden');
    mainSite.style.display = 'none';

    weddingScreen.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (!hasCelebrated) {
      hasCelebrated = true;
      fireConfetti();
    }
  }

  function fireConfetti() {
    if (typeof confetti !== 'function') return;

    const colors = ['#D4AF37', '#9ed1bd', '#722F37', '#F3E5C8', '#baeed9'];

    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors });

    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    }, 250);

    setTimeout(() => {
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    }, 450);

    const end = Date.now() + 3000;
    (function frame() {
      confetti({
        particleCount: 3,
        startVelocity: 25,
        spread: 360,
        ticks: 200,
        origin: { x: Math.random(), y: 0 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = TARGET_TIME - now;

    if (now >= WEDDING_DAY) {
      showWeddingScreen();
      return true;
    }

    if (!els.days) return false;

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    els.days.textContent  = String(days).padStart(2, '0');
    els.hours.textContent = String(hours).padStart(2, '0');
    els.mins.textContent  = String(mins).padStart(2, '0');
    els.secs.textContent  = String(secs).padStart(2, '0');

    return false;
  }

  if (updateCountdown()) return;

  const interval = setInterval(() => {
    if (updateCountdown()) clearInterval(interval);
  }, 1000);
})();

/* ===========================
   TOAST HELPER
   =========================== */
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(message, duration = 3000) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), duration);
}

/* ===========================
   SAVE TO CALENDAR
   =========================== */
function saveToCalendar(eventKey) {
  const events = {
    ceremony:  { name: 'Holy Matrimony',        time: '11:00 AM' },
    aperitivo: { name: 'Aperitivo & Cocktails', time: '2:00 PM' },
    gala:      { name: 'Banquet & Starlight Gala', time: '6:00 PM' },
  };
  const ev = events[eventKey];
  if (ev) showToast(`Saved: ${ev.name} at ${ev.time} on Oct 31, 2026`);
}

/* ===========================
   RSVP FORM (Formspree)
   =========================== */
const rsvpForm = document.getElementById('rsvp-form');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('rsvp-btn');
    const success = document.getElementById('rsvp-success');

    const name = document.getElementById('rsvp-name').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name || !message) {
      rsvpForm.reportValidity();
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Processing...';

    try {
      const response = await fetch(rsvpForm.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(rsvpForm),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Success
      btn.classList.add('hidden');
      success.classList.remove('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

      rsvpForm.reset();
      showToast('Your RSVP and message have been received. Thank you!');

    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.innerHTML = 'Confirm RSVP & Sign Guestbook';
      showToast('Something went wrong. Please try again.');
    }
  });
}

/* ===========================
   DONATION AMOUNT SELECTOR
   =========================== */
document.querySelectorAll('.donation-amt-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.donation-amt-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  });
});

/* ===========================
   CONTRIBUTION MODAL
   =========================== */
const contributionModal = document.getElementById('contribution-modal');
const modalClose = document.getElementById('modal-close');
const donateBtn = document.getElementById('donate-btn');

function openContributionModal() {
  if (!contributionModal) return;
  contributionModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeContributionModal() {
  if (!contributionModal) return;
  contributionModal.classList.add('hidden');
  document.body.style.overflow = '';
}

if (donateBtn) {
  donateBtn.addEventListener('click', openContributionModal);
}

if (modalClose) {
  modalClose.addEventListener('click', closeContributionModal);
}

if (contributionModal) {
  contributionModal.addEventListener('click', (e) => {
    if (e.target === contributionModal) closeContributionModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contributionModal && !contributionModal.classList.contains('hidden')) {
    closeContributionModal();
  }
});

/* Copy-to-clipboard for account details */
document.querySelectorAll('.modal-copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Account number copied to clipboard!');
      const icon = btn.querySelector('.material-symbols-outlined');
      const original = icon.textContent;
      icon.textContent = 'check';
      setTimeout(() => { icon.textContent = original; }, 1500);
    } catch {
      showToast('Could not copy — please copy manually.');
    }
  });
});


/* ===========================
   BACKGROUND MUSIC
   =========================== */
(function initBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  if (!audio || !toggle) return;

  // Restore user's preference from last visit
  const savedPref = localStorage.getItem('music-preference'); // 'on' | 'off' | null
  const wasPlaying = savedPref === 'on';

  // Attempt autoplay if they previously turned it on
  if (wasPlaying) {
    audio.volume = 0.35;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        toggle.classList.add('is-playing');
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Pause background music');
      }).catch(() => {
        // Autoplay blocked — wait for user interaction
        waitForFirstInteraction();
      });
    }
  } else {
    waitForFirstInteraction();
  }

  // Fallback: start on first user gesture if autoplay was blocked
  function waitForFirstInteraction() {
    const startOnce = () => {
      // Only start if the user previously wanted music
      if (wasPlaying && audio.paused) {
        audio.play().then(() => {
          toggle.classList.add('is-playing');
          toggle.setAttribute('aria-pressed', 'true');
          toggle.setAttribute('aria-label', 'Pause background music');
        }).catch(() => {});
      }
      document.removeEventListener('click', startOnce);
      document.removeEventListener('touchstart', startOnce);
      document.removeEventListener('keydown', startOnce);
    };
    document.addEventListener('click', startOnce, { once: true });
    document.addEventListener('touchstart', startOnce, { once: true });
    document.addEventListener('keydown', startOnce, { once: true });
  }

  // Toggle button
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();

    if (audio.paused) {
      audio.volume = 0.35;
      audio.play().then(() => {
        toggle.classList.add('is-playing');
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Pause background music');
        localStorage.setItem('music-preference', 'on');
      }).catch((err) => {
        console.warn('Music playback failed:', err);
      });
    } else {
      audio.pause();
      toggle.classList.remove('is-playing');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.setAttribute('aria-label', 'Play background music');
      localStorage.setItem('music-preference', 'off');
    }
  });

  // Fade volume in smoothly when it starts
  audio.addEventListener('play', () => {
    let vol = 0;
    const target = 0.35;
    const fadeIn = setInterval(() => {
      vol += 0.02;
      if (vol >= target) {
        vol = target;
        clearInterval(fadeIn);
      }
      audio.volume = vol;
    }, 50);
  });

  // Pause when tab is hidden to save battery (optional)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
      audio.dataset.wasPlaying = 'true';
      audio.pause();
    } else if (!document.hidden && audio.dataset.wasPlaying === 'true') {
      audio.play().catch(() => {});
      delete audio.dataset.wasPlaying;
    }
  });
})();