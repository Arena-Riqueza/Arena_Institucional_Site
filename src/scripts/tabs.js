// Tab switching for "Para Quem" section with ARIA support
export function initTabs() {
  document.querySelectorAll('.ptab').forEach((tab, i) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach((t, j) => {
        const isActive = j === i;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        const content = document.getElementById('tab-' + j);
        if (content) content.classList.toggle('active', isActive);
      });
    });
  });
}
