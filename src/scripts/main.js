import '../styles/globals.css'
import { initNavigation } from './navigation.js'
import { initScrollReveal } from './scroll-reveal.js'
import { initTabs } from './tabs.js'
import { initFormHandler } from './form-handler.js'
import { initLangSwitcher } from './lang-switcher.js'
import { initCounters } from './counter.js'

// Initialize all modules on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initTabs();
  initFormHandler();
  initLangSwitcher();
  initCounters();
});
