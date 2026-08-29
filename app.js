/**
 * browserNexus — Product Webpage Script
 * Handles pricing plan switching, FAQ accordion toggles,
 * command snippet copy interactions, and GA4 event tracking.
 */

// --- GA4 Helper ---
function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
}

// --- Pricing Switcher ---
function setupPricingSwitcher() {
  const btnMonthly = document.getElementById('btnPricingMonthly');
  const btnAnnual = document.getElementById('btnPricingAnnual');
  const btnLifetime = document.getElementById('btnPricingLifetime');

  const cardMonthly = document.getElementById('cardMonthly');
  const cardAnnual = document.getElementById('cardAnnual');
  const cardLifetime = document.getElementById('cardLifetime');

  if (!btnMonthly || !btnAnnual || !btnLifetime) return;

  function setPricingMode(mode, userInitiated = false) {
    [btnMonthly, btnAnnual, btnLifetime].forEach(b => b.classList.remove('active'));
    [cardMonthly, cardAnnual, cardLifetime].forEach(c => {
      if (c) c.classList.remove('featured');
    });

    if (mode === 'monthly') {
      btnMonthly.classList.add('active');
      if (cardMonthly) cardMonthly.classList.add('featured');
    } else if (mode === 'annual') {
      btnAnnual.classList.add('active');
      if (cardAnnual) cardAnnual.classList.add('featured');
    } else if (mode === 'lifetime') {
      btnLifetime.classList.add('active');
      if (cardLifetime) cardLifetime.classList.add('featured');
    }

    if (userInitiated) {
      trackEvent('select_pricing_tier', {
        tier: mode
      });
    }
  }

  btnMonthly.addEventListener('click', () => setPricingMode('monthly', true));
  btnAnnual.addEventListener('click', () => setPricingMode('annual', true));
  btnLifetime.addEventListener('click', () => setPricingMode('lifetime', true));
}

// --- FAQ Accordion ---
function setupFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-question');
  if (!faqButtons.length) return;

  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const isOpen = item.classList.contains('open');

      // Close other accordion items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        const answer = item.querySelector('.faq-answer');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
        trackEvent('faq_expand', {
          question: button.textContent.trim()
        });
      }
    });
  });
}

// --- Terminal Snippet Copy ---
function setupSnippetCopy() {
  const btnCopy = document.getElementById('btnCopyInstall');
  if (!btnCopy) return;

  btnCopy.addEventListener('click', () => {
    const code = 'curl -fsSL https://browsernexus.com/install.sh | bash';
    navigator.clipboard.writeText(code).then(() => {
      btnCopy.textContent = 'Copied!';
      btnCopy.style.color = 'var(--accent-green)';
      setTimeout(() => {
        btnCopy.textContent = 'Copy';
        btnCopy.style.color = 'var(--accent-primary)';
      }, 2000);

      trackEvent('copy_install_command', {
        event_category: 'engagement',
        event_label: 'curl_install_snippet'
      });
    });
  });
}

// --- CTA Click Tracking ---
function setupCtaTracking() {
  document.querySelectorAll('a.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const btnText = btn.textContent.trim();
      const href = btn.getAttribute('href');
      trackEvent('click_cta', {
        cta_text: btnText,
        cta_destination: href
      });
    });
  });
}

// --- Buy Me a Coffee Floating Widget & Modal ---
function setupFloatingBmc() {
  const btn = document.getElementById('floatingBmcBtn');
  const modal = document.getElementById('bmcModal');
  const closeBtn = document.getElementById('bmcModalClose');
  const backdrop = document.getElementById('bmcModalBackdrop');

  if (!btn || !modal) return;

  let isShaking = false;
  function triggerShake() {
    if (isShaking) return;
    isShaking = true;
    btn.classList.add('is-shaking');
    setTimeout(() => {
      btn.classList.remove('is-shaking');
      isShaking = false;
    }, 1000);
  }

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trackEvent('open_bmc_modal', {
      source: 'floating_widget'
    });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Click on floating button: shake for 1 second and open modal
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    triggerShake();
    openModal();
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Scroll handler: shake the button for 1 second whenever user scrolls
  let lastScrollShake = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollShake > 2500) {
      triggerShake();
      lastScrollShake = now;
    }
  }, { passive: true });
}

// --- Global Namespace ---
window.browserNexus = {
  version: '1.0.0',
  trackEvent: trackEvent
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupPricingSwitcher();
  setupFaqAccordion();
  setupSnippetCopy();
  setupCtaTracking();
  setupFloatingBmc();
});
