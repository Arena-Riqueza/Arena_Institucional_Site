// Animated counter for number elements
export function initCounters() {
  const counters = document.querySelectorAll('.number-val, .hero-badge-num, .ptab-stat-num');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => {
    el.dataset.final = el.textContent.trim();
    obs.observe(el);
  });
}

function animateCounter(el) {
  const raw = el.dataset.final;
  const duration = 1800;
  const steps = 60;
  const interval = duration / steps;

  // Parse the numeric value and detect prefix/suffix
  const match = raw.match(/^([^\d-]*)([-]?\d+[.,]?\d*)(.*)/);
  if (!match) return; // Not a number pattern

  const prefix = match[1];       // e.g. "R$", "$", ""
  const numStr = match[2];       // e.g. "79,5", "10", "1816"
  const suffix = match[3];       // e.g. "%", "+", "k", "k+"

  // Handle comma as decimal separator (Brazilian format)
  const hasComma = numStr.includes(',');
  const hasDot = numStr.includes('.');
  const cleanNum = parseFloat(numStr.replace(',', '.'));
  const decimals = hasComma ? (numStr.split(',')[1] || '').length : (hasDot ? (numStr.split('.')[1] || '').length : 0);

  let step = 0;
  el.textContent = prefix + '0' + suffix;

  const timer = setInterval(() => {
    step++;
    const progress = easeOutCubic(step / steps);
    const current = cleanNum * progress;

    let formatted;
    if (decimals > 0) {
      formatted = current.toFixed(decimals).replace('.', ',');
    } else {
      formatted = Math.round(current).toString();
    }

    el.textContent = prefix + formatted + suffix;

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = raw; // Restore exact original text
    }
  }, interval);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
