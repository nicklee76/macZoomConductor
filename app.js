/**
 * browserNexus — Product Webpage Script
 * Handles pricing plan switching, FAQ accordion toggles,
 * and command snippet copy interactions.
 */

// --- Pricing Switcher ---
function setupPricingSwitcher() {
  const btnMonthly = document.getElementById('btnPricingMonthly');
  const btnAnnual = document.getElementById('btnPricingAnnual');
  const btnLifetime = document.getElementById('btnPricingLifetime');

  const cardMonthly = document.getElementById('cardMonthly');
  const cardAnnual = document.getElementById('cardAnnual');
  const cardLifetime = document.getElementById('cardLifetime');

  if (!btnMonthly || !btnAnnual || !btnLifetime) return;

  function setPricingMode(mode) {
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
  }

  btnMonthly.addEventListener('click', () => setPricingMode('monthly'));
  btnAnnual.addEventListener('click', () => setPricingMode('annual'));
  btnLifetime.addEventListener('click', () => setPricingMode('lifetime'));
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
    });
  });
}

// --- Global Namespace ---
window.browserNexus = {
  version: '1.0.0'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupPricingSwitcher();
  setupFaqAccordion();
  setupSnippetCopy();
});
