/* ==========================================================================
   PorsiFit — main.js
   Lead form + Google Sheets (Apps Script) + modal + FAQ + tracking via GTM dataLayer
   ========================================================================== */

'use strict';

/* dataLayer untuk GTM — semua tracking lewat sini */
window.dataLayer = window.dataLayer || [];

/* ── Konfigurasi ─────────────────────────────────────────── */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxq34f64RuFqPA1Zhsm6WWEJHeaW2ifVluVo2QjadxES4vyZwhDoFw10vgglDO8eAShdw/exec';

/* ── Welcome pop-up ──────────────────────────────────────────
   NONAKTIF secara default. Ubah `enabled` jadi true kalau tim
   memutuskan pop-up ini dipakai. Aturannya sengaja dibuat supaya
   pop-up tidak pernah menutupi lead form di atas fold:
     - baru muncul setelah pengunjung melewati hero
     - plus jeda waktu, jadi tidak menyergap begitu halaman terbuka
     - cuma sekali per sesi
     - tidak muncul kalau pengunjung sudah mengisi form
   ---------------------------------------------------------- */
const WELCOME_POPUP = {
  enabled: false,          // ← ubah ke true untuk mengaktifkan
  delayMs: 9000,           // jeda sebelum boleh muncul
  requireScrollPastHero: true,
  oncePerSession: true,
};

/* ── Menu mobile ─────────────────────────────────────────── */
(function initBurger() {
  const burger = document.getElementById('burger');
  const links  = document.getElementById('nav-links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ── Tracking klik CTA ───────────────────────────────────── */
document.querySelectorAll('.js-cta').forEach((el) => {
  el.addEventListener('click', () => {
    dataLayer.push({ event: 'cta_click', cta_location: el.dataset.cta || 'unknown' });
  });
});

/* ── Form waiting list ───────────────────────────────────── */
(function initForm() {
  const form       = document.getElementById('signup-form');
  if (!form) return;

  const submitBtn  = document.getElementById('submit-btn');
  const nameInput  = document.getElementById('full-name');
  const igInput    = document.getElementById('instagram');
  const consent    = document.getElementById('consent');
  const nameError  = document.getElementById('name-error');
  const igError    = document.getElementById('ig-error');
  const consentErr = document.getElementById('consent-error');

  function showErr(input, errEl, msg) {
    if (input) { input.classList.add('is-invalid'); input.classList.remove('is-valid'); }
    errEl.textContent = msg;
  }
  function clearErr(input, errEl) {
    if (input) input.classList.remove('is-invalid');
    errEl.textContent = '';
  }
  function markValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  }

  nameInput.addEventListener('input', () => clearErr(nameInput, nameError));
  igInput.addEventListener('input',   () => clearErr(igInput, igError));
  consent.addEventListener('change',  () => clearErr(null, consentErr));

  function validate() {
    let ok = true;
    const name = nameInput.value.trim();
    const ig   = igInput.value.trim().replace(/^@/, '');

    if (name.length < 2) {
      showErr(nameInput, nameError, 'Nama minimal 2 karakter.');
      ok = false;
    } else {
      markValid(nameInput);
    }

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(ig)) {
      showErr(igInput, igError, 'Masukkan username Instagram yang valid.');
      ok = false;
    } else {
      markValid(igInput);
    }

    if (!consent.checked) {
      consentErr.textContent = 'Centang persetujuan dulu ya.';
      ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) {
      dataLayer.push({ event: 'form_error', form_id: 'waitlist' });
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    const payload = {
      nama:      nameInput.value.trim(),
      instagram: igInput.value.trim().replace(/^@/, ''),
    };

    /* Apps Script tidak mengirim header CORS untuk fetch biasa, jadi kita
       pakai mode no-cors. Respons tidak bisa dibaca, tapi data tetap
       masuk ke Google Sheet. */
    fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify(payload),
    })
      .then(() => {
        dataLayer.push({
          event:    'generate_lead',
          method:   'waitlist_form',
          currency: 'IDR',
          value:    1,
        });

        const igName = '@' + payload.instagram;
        const tyIg   = document.getElementById('ty-ig-name');
        if (tyIg) tyIg.textContent = igName;

        const successIg = document.getElementById('success-ig-name');
        if (successIg) successIg.textContent = igName;

        openOverlay(document.getElementById('ty-overlay'));

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gabung Waiting List';
        form.reset();
      })
      .catch(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Coba lagi';
        igError.textContent = 'Koneksi bermasalah. Cek internetmu lalu coba lagi.';
        dataLayer.push({ event: 'form_error', form_id: 'waitlist', reason: 'network' });
      });
  });
})();

/* ── Modal ───────────────────────────────────────────────── */
let lastFocused = null;

function openOverlay(overlay) {
  if (!overlay) return;
  lastFocused = document.activeElement;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const btn = overlay.querySelector('.modal-close');
  setTimeout(() => btn && btn.focus(), 60);
}

function closeOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

/* Setelah Thank You ditutup, form diganti pesan sukses */
function afterThankYou() {
  const def = document.getElementById('form-default');
  const suc = document.getElementById('form-success');
  if (def) def.hidden = true;
  if (suc) suc.hidden = false;
}

(function initModals() {
  const privacy = document.getElementById('privacy-overlay');
  const tnc     = document.getElementById('tnc-overlay');
  const ty      = document.getElementById('ty-overlay');

  document.querySelectorAll('.privacy-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openOverlay(privacy);
      dataLayer.push({ event: 'view_privacy_policy' });
    });
  });

  const tncLink = document.getElementById('open-tnc');
  if (tncLink) {
    tncLink.addEventListener('click', (e) => { e.preventDefault(); openOverlay(tnc); });
  }

  [['pp-close', privacy], ['pp-close-btn', privacy],
   ['tnc-close', tnc],    ['tnc-close-btn', tnc]].forEach(([id, ov]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => closeOverlay(ov));
  });

  ['ty-close-x', 'ty-close-btn'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { closeOverlay(ty); afterThankYou(); });
  });

  document.querySelectorAll('.overlay').forEach((ov) => {
    ov.addEventListener('click', (e) => {
      if (e.target !== ov) return;
      closeOverlay(ov);
      if (ov === ty) afterThankYou();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.overlay.is-open').forEach((ov) => {
      closeOverlay(ov);
      if (ov === ty) afterThankYou();
    });
  });

  /* Focus trap */
  document.querySelectorAll('.overlay').forEach((ov) => {
    ov.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(ov.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
})();

/* ── FAQ accordion ───────────────────────────────────────── */
(function initFaq() {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (!triggers.length) return;

  function close(trigger) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', 'false');
    if (!panel) return;
    panel.style.maxHeight = '0';
    panel.addEventListener('transitionend', function handler() {
      if (trigger.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      panel.removeEventListener('transitionend', handler);
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      triggers.forEach((t) => { if (t !== trigger) close(t); });

      if (isOpen) { close(trigger); return; }

      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', 'true');
      if (!panel) return;
      panel.hidden = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { panel.style.maxHeight = panel.scrollHeight + 'px'; });
      });
      dataLayer.push({ event: 'faq_open', question: trigger.textContent.replace('+', '').trim() });
    });
  });
})();

/* ── Scroll reveal ───────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const byParent = new Map();
  targets.forEach((el) => {
    if (!byParent.has(el.parentElement)) byParent.set(el.parentElement, []);
    byParent.get(el.parentElement).push(el);
  });
  byParent.forEach((siblings) => {
    siblings.forEach((el, i) => { el.style.transitionDelay = (i * 80) + 'ms'; });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => io.observe(el));
})();

/* ── Scroll depth (untuk lihat sejauh mana orang baca) ───── */
(function initScrollDepth() {
  const marks = [25, 50, 75, 90];
  const fired = new Set();
  let ticking = false;

  function check() {
    const h = document.documentElement;
    const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
    marks.forEach((m) => {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        dataLayer.push({ event: 'scroll_depth', percent: m });
      }
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  }, { passive: true });
})();


/* ── Welcome pop-up ──────────────────────────────────────── */
(function initWelcome() {
  const overlay = document.getElementById('welcome-overlay');
  if (!overlay || !WELCOME_POPUP.enabled) return;

  const KEY = 'pf_welcome_seen';
  if (WELCOME_POPUP.oncePerSession) {
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  }

  let shown = false;
  let timerDone = false;

  function alreadyConverted() {
    const suc = document.getElementById('form-success');
    return suc && !suc.hidden;
  }

  function heroPassed() {
    const hero = document.getElementById('beranda');
    return !hero || hero.getBoundingClientRect().bottom < 0;
  }

  function show() {
    if (shown || alreadyConverted()) return;
    if (document.querySelector('.overlay.is-open')) return;
    shown = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    openOverlay(overlay);
    dataLayer.push({ event: 'welcome_popup_view' });
  }

  function maybeShow() {
    if (!timerDone) return;
    if (WELCOME_POPUP.requireScrollPastHero && !heroPassed()) return;
    show();
    window.removeEventListener('scroll', maybeShow);
  }

  setTimeout(() => { timerDone = true; maybeShow(); }, WELCOME_POPUP.delayMs);
  window.addEventListener('scroll', maybeShow, { passive: true });

  const closeBtn = document.getElementById('welcome-close');
  const later    = document.getElementById('welcome-later');
  const cta      = document.getElementById('welcome-cta');

  [closeBtn, later].forEach((el) => {
    if (el) el.addEventListener('click', () => {
      closeOverlay(overlay);
      dataLayer.push({ event: 'welcome_popup_dismiss' });
    });
  });

  if (cta) {
    cta.addEventListener('click', () => {
      closeOverlay(overlay);
      dataLayer.push({ event: 'cta_click', cta_location: 'welcome_popup' });
      const form = document.getElementById('form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const nameField = document.getElementById('full-name');
        if (nameField) nameField.focus();
      }, 700);
    });
  }
})();
