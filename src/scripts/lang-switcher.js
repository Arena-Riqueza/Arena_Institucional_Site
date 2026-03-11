// Language switcher toggle
export function initLangSwitcher() {
  const switcher = document.getElementById('lang-switcher');
  if (!switcher) return;

  const btn = switcher.querySelector('.lang-btn');
  const options = switcher.querySelectorAll('.lang-option');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = switcher.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close on outside click
  document.addEventListener('click', () => {
    switcher.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Handle language selection
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.dataset.lang;
      const flag = option.querySelector('span').textContent;
      const code = lang.split('-')[0].toUpperCase();

      // Update active state
      options.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      // Update button display
      switcher.querySelector('.lang-flag').textContent = flag;
      switcher.querySelector('.lang-code').textContent = code;

      // Close dropdown
      switcher.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');

      // Store preference
      localStorage.setItem('arena-lang', lang);

      // Update HTML lang attribute
      document.documentElement.lang = lang;
    });
  });

  // Restore saved preference
  const saved = localStorage.getItem('arena-lang');
  if (saved) {
    const savedOption = switcher.querySelector(`[data-lang="${saved}"]`);
    if (savedOption) savedOption.click();
  }
}
