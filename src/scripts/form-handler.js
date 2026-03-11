// UTM parameter capture and form handling
// Prepara dados de rastreamento para integração futura com o CRM

export function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || 'direct',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    origin_id: params.get('origin_id') || '',
    referrer: document.referrer || '',
    landing_page: window.location.pathname,
  };
}

export function initFormHandler() {
  // Store UTMs in sessionStorage for persistence across pages
  const utms = getUTMParams();
  if (utms.utm_source !== 'direct' || utms.origin_id) {
    sessionStorage.setItem('arena_utm', JSON.stringify(utms));
  }

  // Inject hidden UTM fields into any form with data-arena-form attribute
  document.querySelectorAll('form[data-arena-form]').forEach(form => {
    const stored = JSON.parse(sessionStorage.getItem('arena_utm') || '{}');
    Object.entries(stored).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    });
  });
}
