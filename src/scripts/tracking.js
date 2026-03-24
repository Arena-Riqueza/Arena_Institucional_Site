// Arena da Riqueza — Tracking (Meta Pixel + GA4)
// Respeita consentimento LGPD: so carrega apos aceite do usuario

const PIXEL_ID = '916468751176404';
const GA4_ID = ''; // TODO: inserir GA4 Measurement ID (G-XXXXXXXXXX)
const CONSENT_KEY = 'arena_cookie_consent';

// ── Consent Management ──

export function hasConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

export function setConsent(accepted) {
  localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'rejected');
  if (accepted) {
    loadTracking();
  }
}

// ── Meta Pixel ──

function loadMetaPixel() {
  if (!PIXEL_ID || typeof window.fbq === 'function') return;

  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

// ── Google Analytics 4 ──

function loadGA4() {
  if (!GA4_ID || document.querySelector(`script[src*="${GA4_ID}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID);
}

// ── Load All Tracking ──

function loadTracking() {
  loadMetaPixel();
  loadGA4();
}

// ── Conversion Events ──

export function trackLead(interest, utmSource) {
  // Meta Pixel — Lead event
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: interest || 'contato',
      content_category: utmSource || 'direct',
    });
  }

  // GA4 — generate_lead event
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      currency: 'BRL',
      value: 0,
      event_category: interest || 'contato',
      event_label: utmSource || 'direct',
    });
  }
}

// ── Cookie Banner ──

export function initCookieBanner() {
  // Se ja deu consentimento, carregar tracking direto
  if (hasConsent()) {
    loadTracking();
    return;
  }

  // Se ja rejeitou, nao mostrar banner novamente
  if (localStorage.getItem(CONSENT_KEY) === 'rejected') return;

  // Criar banner
  const banner = document.createElement('div');
  banner.id = 'arena-cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-content">
      <p>Utilizamos cookies para melhorar sua experiência e analisar o tráfego do site.
      Ao aceitar, você concorda com o uso de cookies conforme nossa
      <a href="/politica-de-privacidade" style="color: #ffaa00; text-decoration: underline;">Política de Privacidade</a>.</p>
      <div class="cookie-banner-actions">
        <button id="cookie-accept" class="cookie-btn cookie-btn-accept">Aceitar</button>
        <button id="cookie-reject" class="cookie-btn cookie-btn-reject">Recusar</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', () => {
    setConsent(true);
    banner.remove();
  });

  document.getElementById('cookie-reject').addEventListener('click', () => {
    setConsent(false);
    banner.remove();
  });
}
