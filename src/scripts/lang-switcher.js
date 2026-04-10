import { applyTranslations, getCurrentLang } from './i18n.js';

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

  document.addEventListener('click', () => {
    switcher.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.dataset.lang;
      const flag = option.querySelector('span').textContent;
      const code = lang.split('-')[0].toUpperCase();

      options.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      switcher.querySelector('.lang-flag').textContent = flag;
      switcher.querySelector('.lang-code').textContent = code;

      switcher.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');

      localStorage.setItem('arena-lang', lang);

      // Apply translations to all marked elements
      applyTranslations(lang);
    });
  });

  // Restore saved preference
  const saved = getCurrentLang();
  if (saved && saved !== 'pt-BR') {
    const savedOption = switcher.querySelector(`[data-lang="${saved}"]`);
    if (savedOption) {
      const flag = savedOption.querySelector('span').textContent;
      const code = saved.split('-')[0].toUpperCase();
      options.forEach(o => o.classList.remove('active'));
      savedOption.classList.add('active');
      switcher.querySelector('.lang-flag').textContent = flag;
      switcher.querySelector('.lang-code').textContent = code;
    }
  }
}
