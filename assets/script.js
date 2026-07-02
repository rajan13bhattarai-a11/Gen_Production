/* ===========================
   GEN PRODUCTION — Script v2
   =========================== */

// --- YOUTUBE SCROLL-TRIGGERED AUTOPLAY ---
// Load the YouTube IFrame API
(function () {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

let showreelPlayer = null;
let showreelVisible = false;
let showreelReady = false;

// Called automatically by YouTube API when ready
window.onYouTubeIframeAPIReady = function () {
  const iframe = document.getElementById('showreel-iframe');
  if (!iframe) return;

  const soundToggle = document.getElementById('showreel-sound-toggle');

  showreelPlayer = new YT.Player('showreel-iframe', {
    events: {
      onReady: function (e) {
        showreelReady = true;
        // Set to highest available quality
        e.target.setPlaybackQuality('hd1080');
        // Must start muted for autoplay to be allowed by browsers
        e.target.mute();
        if (soundToggle) {
          soundToggle.classList.remove('is-unmuted');
          soundToggle.setAttribute('aria-pressed', 'false');
          soundToggle.setAttribute('aria-label', 'Unmute video');
        }
        // If the showreel is already in view by the time the player is ready, start it
        if (showreelVisible) {
          try { e.target.playVideo(); } catch (err) {}
        }
      }
    }
  });

  // Mute/unmute toggle
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (!showreelPlayer || !showreelReady) return;
      const isMuted = showreelPlayer.isMuted();
      if (isMuted) {
        showreelPlayer.unMute();
        showreelPlayer.setPlaybackQuality('hd1080');
      } else {
        showreelPlayer.mute();
      }
      const nowUnmuted = isMuted; // toggled state
      soundToggle.classList.toggle('is-unmuted', nowUnmuted);
      soundToggle.setAttribute('aria-pressed', String(nowUnmuted));
      soundToggle.setAttribute('aria-label', nowUnmuted ? 'Mute video' : 'Unmute video');
    });
  }

  // Observe the showreel frame for visibility
  const frame = document.getElementById('showreel-frame');
  if (!frame) return;

  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      showreelVisible = entry.isIntersecting;
      if (!showreelPlayer || !showreelReady) return;
      try {
        if (showreelVisible) {
          showreelPlayer.playVideo();
          showreelPlayer.setPlaybackQuality('hd1080');
        } else {
          showreelPlayer.pauseVideo();
        }
      } catch (e) { /* player not ready yet */ }
    });
  }, { threshold: 0.5 }); // at least 50% visible to play

  visibilityObserver.observe(frame);
};

// --- MOBILE MENU ---
const menuToggle = document.querySelector('.menu-toggle');
const nav        = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', false);
  });
});

// --- HEADER SCROLL STATE ---
const header = document.getElementById('site-header');

const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- REVEAL ANIMATIONS ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// --- CONTACT FORM (Formspree) ---
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Update button state
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const response = await fetch('https://formspree.io/f/xykqzwaq', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        showToast('Message sent! We\'ll be in touch soon.', 'success');
        form.reset();
      } else {
        const data = await response.json();
        const errMsg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  });
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    padding: '14px 22px',
    background: type === 'success' ? '#c9a84c' : '#a04040',
    color: type === 'success' ? '#0a0a0a' : '#f2ede6',
    fontSize: '13px',
    letterSpacing: '0.5px',
    borderRadius: '3px',
    zIndex: '9999',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'all .3s ease',
    maxWidth: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// --- SMOOTH ACTIVE NAV ---
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--snow)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// --- PORTFOLIO VIDEO: PLAY ON SCROLL INTO VIEW, PAUSE WHEN SCROLLED AWAY ---
(function () {
  const card    = document.getElementById('videography-card');
  const video   = document.getElementById('videography-video');
  const toggle  = document.getElementById('videography-sound-toggle');
  if (!card || !video || !toggle) return;

  // Mute/unmute toggle
  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    const unmuted = !video.muted;
    toggle.classList.toggle('is-unmuted', unmuted);
    toggle.classList.toggle('visible', unmuted);
    toggle.setAttribute('aria-pressed', String(unmuted));
    toggle.setAttribute('aria-label', unmuted ? 'Mute video' : 'Unmute video');
  });

  // Play while the card is sufficiently visible, pause once it scrolls
  // out of view in either direction.
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => { /* autoplay may be blocked until interaction */ });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  videoObserver.observe(card);
})();

// --- PORTFOLIO VIDEO MODAL (Short Film / Brand Content / Videography & Editing) ---
(function () {
  const modal      = document.getElementById('pf-modal');
  if (!modal) return; // only present on portfolio video-list pages

  const modalInner = modal.querySelector('.pf-modal-inner');

  function openModal(youtubeId) {
    modalInner.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
        title="Portfolio video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
      <button class="pf-modal-close" type="button" aria-label="Close video">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modalInner.innerHTML = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-youtube-id]').forEach(card => {
    card.addEventListener('click', () => openModal(card.getAttribute('data-youtube-id')));
  });

  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('.pf-modal-close')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

// --- AUTOMATIC PHOTOGRAPHY GALLERY LAYOUT ---
// You can now add photos using only:
// <div class="pf-gallery-item reveal-up" style="background-image:url('../images/photo-name.jpg')"></div>
// The script will automatically repeat this layout:
// A: normal, normal, wide
// B: wide, normal, normal
// C: normal, wide, normal
(function () {
  const galleries = document.querySelectorAll('.pf-gallery');
  if (!galleries.length) return;

  galleries.forEach(gallery => {
    const items = Array.from(gallery.querySelectorAll('.pf-gallery-item'));

    items.forEach((item, index) => {
      // Remove old/manual size classes so the repeated pattern controls everything.
      item.classList.remove('span-2', 'pf-wide');

      const patternPosition = index % 9;

      // Wide photos repeat at positions 3, 4, and 8 in every 9-photo cycle.
      // This creates A → B → C → repeat:
      // A: □ □ ▬▬
      // B: ▬▬ □ □
      // C: □ ▬▬ □
      if ([2, 3, 7].includes(patternPosition)) {
        item.classList.add('pf-wide');
      }

      // Automatic reveal delay, so you do not need to write --d manually.
      item.style.setProperty('--d', `${(index % 9) * 80}ms`);
    });
  });
})();
