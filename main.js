/* ============================================================
   Sajiin Catering — main.js
   Features: Form validation, accordion
   ============================================================ */

// ── Accordion ──────────────────────────────────────────────
document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    const panelId = trigger.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);

    // Close all others
    document.querySelectorAll('.accordion-trigger').forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.accordion-panel').forEach((p) => {
      p.hidden = true;
    });

    // Toggle clicked one
    if (!isExpanded) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;

      // Smooth reveal via max-height animation
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// ── Form Validation ────────────────────────────────────────
const form = document.getElementById('prelaunch-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Name
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, nameError, 'Nama minimal 2 karakter.');
      valid = false;
    } else {
      clearError(nameInput, nameError);
    }

    // WhatsApp
    const waInput = document.getElementById('whatsapp');
    const waError = document.getElementById('wa-error');
    const waWrapper = waInput.closest('.input-with-prefix');
    const waVal = waInput.value.trim().replace(/[\s\-]/g, '');
    if (!waVal || !/^\d{8,13}$/.test(waVal)) {
      waWrapper.classList.add('invalid');
      waError.textContent = 'Nomor WhatsApp tidak valid (8–13 digit).';
      valid = false;
    } else {
      waWrapper.classList.remove('invalid');
      waError.textContent = '';
    }

    // Email
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      showError(emailInput, emailError, 'Masukkan email yang valid.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    if (valid) {
      // Simulate submission
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Mendaftar…';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.hidden = true;
        formSuccess.hidden = false;
      }, 1000);
    }
  });

  // Clear errors on input
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      clearError(input, document.getElementById(input.id + '-error') ||
        document.getElementById(input.id.replace('whatsapp', 'wa') + '-error'));
      const wrapper = input.closest('.input-with-prefix');
      if (wrapper) wrapper.classList.remove('invalid');
    });
  });
}

function showError(input, errorEl, message) {
  input.classList.add('invalid');
  if (errorEl) errorEl.textContent = message;
}

function clearError(input, errorEl) {
  if (input) input.classList.remove('invalid');
  if (errorEl) errorEl.textContent = '';
}

// ── Smooth scroll for anchor CTA links ────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Scroll-in animation ────────────────────────────────────
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.pricing-card, .accordion-item, .stat').forEach((el) => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// Inject fade-up CSS dynamically
const style = document.createElement('style');
style.textContent = `
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
