/* ============================================================
   Sajiin Catering — main.js
   Features: Countdown timer, form validation, animations
   ============================================================ */

// ── Launch countdown (target: 45 days from now) ────────────
(function initCountdown() {
  const LAUNCH = new Date();
  LAUNCH.setDate(LAUNCH.getDate() + 45);
  LAUNCH.setHours(0, 0, 0, 0);

  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = LAUNCH - Date.now();
    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    if (els.days)  els.days.textContent  = pad(days);
    if (els.hours) els.hours.textContent = pad(hours);
    if (els.mins)  els.mins.textContent  = pad(mins);
    if (els.secs)  els.secs.textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

// ── Form validation & submission ───────────────────────────
const form       = document.getElementById('signup-form');
const successBox = document.getElementById('form-success');
const submitBtn  = document.getElementById('submit-btn');

const nameInput = document.getElementById('full-name');
const igInput   = document.getElementById('instagram');
const nameError = document.getElementById('name-error');
const igError   = document.getElementById('ig-error');

function showErr(input, errEl, msg) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  errEl.textContent = msg;
}

function clearErr(input, errEl) {
  input.classList.remove('is-invalid');
  errEl.textContent = '';
}

function markValid(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
}

// Live clear on input
nameInput.addEventListener('input', () => clearErr(nameInput, nameError));
igInput.addEventListener('input',   () => clearErr(igInput, igError));

// Validate
function validate() {
  let ok = true;
  const name = nameInput.value.trim();
  const ig   = igInput.value.trim().replace(/^@/, '');

  if (!name || name.length < 2) {
    showErr(nameInput, nameError, 'Nama minimal 2 karakter.');
    ok = false;
  } else {
    markValid(nameInput);
  }

  if (!ig || !/^[a-zA-Z0-9._]{1,30}$/.test(ig)) {
    showErr(igInput, igError, 'Masukkan username Instagram yang valid.');
    ok = false;
  } else {
    markValid(igInput);
  }

  return ok;
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxq34f64RuFqPA1Zhsm6WWEJHeaW2ifVluVo2QjadxES4vyZwhDoFw10vgglDO8eAShdw/exec';
    const payload = {
      nama: nameInput.value.trim(),
      instagram: igInput.value.trim().replace(/^@/, ''),
    };

    // no-cors mode: Google Apps Script doesn't send CORS headers that
    // satisfy a credentialed fetch, so we use no-cors (opaque response).
    // We can't read the response body, but the data still lands in the Sheet.
    fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',          // ← key fix: skips CORS check
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload),
    })
      .then(() => {
        // With no-cors we always get an opaque response — treat reaching
        // here as success (the POST was sent).
        const igVal = payload.instagram;

        // Show thank-you popup
        const tyOverlay = document.getElementById('ty-overlay');
        const tyIgName  = document.getElementById('ty-ig-name');
        if (tyIgName)  tyIgName.textContent  = '@' + igVal;
        if (tyOverlay) {
          tyOverlay.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }

        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      })
      .catch(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Coba Lagi';
        alert('Tidak dapat terhubung. Periksa koneksi internetmu dan coba lagi.');
      });
  }); // Akhir dari event listener
} // Akhir dari if (form)

// ── Scroll-in / entrance animations ────────────────────────
function animateOnScroll() {
  const targets = document.querySelectorAll(
    '.pill-badge, .headline, .subheadline, .countdown, .perks-row, .form-section, .panel-footer'
  );

  targets.forEach((el, i) => {
    el.classList.add('fade-in');
    // Stagger entrance delay based on index
    el.style.transitionDelay = `${i * 60}ms`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach((el) => io.observe(el));
}

// Food cards staggered entrance
function animateFoodCards() {
  const cards = document.querySelectorAll('.food-card, .badge-float');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(28px) scale(.97)';
    card.style.transition = `opacity .55s ease ${i * 100 + 200}ms, transform .55s ease ${i * 100 + 200}ms`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity = '';
        card.style.transform = '';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  animateFoodCards();
});


// ── FAQ Accordion ───────────────────────────────────────────
(function initFaq() {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isOpen   = trigger.getAttribute('aria-expanded') === 'true';
      const panelId  = trigger.getAttribute('aria-controls');
      const panel    = document.getElementById(panelId);

      // Close every other open item first
      triggers.forEach((t) => {
        if (t === trigger) return;
        t.setAttribute('aria-expanded', 'false');
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) {
          p.style.maxHeight = '0';
          // hide after transition so it leaves the flow
          p.addEventListener('transitionend', () => { p.hidden = true; }, { once: true });
        }
      });

      if (isOpen) {
        // Close this one
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0';
        panel.addEventListener('transitionend', () => { panel.hidden = true; }, { once: true });
      } else {
        // Open this one
        panel.hidden = false;
        // Allow paint before animating
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            panel.style.maxHeight = panel.scrollHeight + 'px';
          });
        });
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Give panels the CSS transition they need
  const style = document.createElement('style');
  style.textContent = `
    .faq-answer {
      overflow: hidden;
      max-height: 0;
      transition: max-height .35s ease;
    }
    .faq-answer:not([hidden]) {
      /* max-height set by JS */
    }
  `;
  document.head.appendChild(style);
})();

// ── Scroll-reveal for .ds-reveal elements ──────────────────
(function initReveal() {
  const targets = document.querySelectorAll('.ds-reveal');
  if (!targets.length) return;

  // Stagger siblings inside the same parent grid/list
  const parentMap = new Map();
  targets.forEach((el) => {
    const key = el.parentElement;
    if (!parentMap.has(key)) parentMap.set(key, []);
    parentMap.get(key).push(el);
  });
  parentMap.forEach((siblings) => {
    siblings.forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => io.observe(el));
})();

// ── Privacy Policy Modal ────────────────────────────────────
(function initPrivacyModal() {
  const overlay   = document.getElementById('privacy-overlay');
  const closeBtn  = document.getElementById('pp-close');
  const closeCta  = document.getElementById('pp-close-btn');
  const trigger   = document.querySelector('.privacy-link');

  if (!overlay) return;

  function openModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Move focus to close button for a11y
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to trigger
    if (trigger) trigger.focus();
  }

  // Open via privacy link
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Close via X button
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close via "Saya Mengerti" button
  if (closeCta) closeCta.addEventListener('click', closeModal);

  // Close on backdrop click (not on modal itself)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Trap focus inside modal while open
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ── Thank You Popup ─────────────────────────────────────────
(function initTyPopup() {
  const overlay  = document.getElementById('ty-overlay');
  const closeBtn = document.getElementById('ty-close-btn');
  const closeX   = document.getElementById('ty-close-x');
  if (!overlay) return;

  function closeTy() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';

    // Replace form with success state so user sees confirmation
    const formDefault  = document.getElementById('form-default');
    const formSuccess  = document.getElementById('form-success');
    const successIgEl  = document.getElementById('success-ig-name');
    const tyIgEl       = document.getElementById('ty-ig-name');

    // Copy the IG name from popup to inline success message
    if (successIgEl && tyIgEl) {
      successIgEl.textContent = tyIgEl.textContent;
    }

    if (formDefault) formDefault.hidden = true;
    if (formSuccess) formSuccess.hidden = false;

    // Scroll form section into view
    const formSection = document.getElementById('form');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeTy);
  if (closeX)   closeX.addEventListener('click',   closeTy);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTy();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeTy();
  });
})();
