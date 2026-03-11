// Nav scroll behavior + mobile menu
export function initNavigation() {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
      burger.classList.toggle('active');
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('active');
      });
    });
  }
}
