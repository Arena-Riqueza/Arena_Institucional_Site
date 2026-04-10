import '../styles/globals.css'
import { initNavigation } from './navigation.js'
import { initScrollReveal } from './scroll-reveal.js'
import { initTabs } from './tabs.js'
import { initFormHandler } from './form-handler.js'
import { initLangSwitcher } from './lang-switcher.js'
import { initCounters } from './counter.js'
import { initCookieBanner } from './tracking.js'
import { initI18n } from './i18n.js'

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initTabs();
  initFormHandler();
  initI18n();        // apply saved lang before rendering
  initLangSwitcher();
  initCounters();
  initCookieBanner();
});
