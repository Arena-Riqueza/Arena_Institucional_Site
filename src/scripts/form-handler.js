// UTM parameter capture and lead form submission to CRM API
import { trackLead } from './tracking.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const SITE_WEBHOOK_SECRET = import.meta.env.VITE_SITE_WEBHOOK_SECRET || 'arena-site-wh-2026-secure';

export function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
    utmTerm: params.get('utm_term') || '',
    originId: params.get('origin_id') || '',
  };
}

// Captura o ID do consultor via ?ref=<uuid|referralCode>
// Aceita dois formatos:
//   - UUID do consultor: arenaglobal.com.br?ref=<uuid-consultor>
//   - referralCode alfanumérico (8 chars): arenaglobal.com.br?ref=ABC123xy
// O backend resolve ambos para o consultantId correto.
function getConsultantRef() {
  const params = new URLSearchParams(window.location.search);
  const ref = (params.get('ref') || '').trim();
  if (!ref) return '';
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const REFERRAL_CODE_REGEX = /^[A-Za-z0-9]{6,16}$/;
  if (UUID_REGEX.test(ref) || REFERRAL_CODE_REGEX.test(ref)) return ref;
  return '';
}

// ── Phone formatting ──

function digitsOnly(str) {
  return str.replace(/\D/g, '');
}

function formatBrazilPhone(digits) {
  // digits = "55" + DDD + number (10 or 11 digits after 55)
  const local = digits.slice(2); // remove country code
  if (local.length <= 2) return `+55 (${local}`;
  const ddd = local.slice(0, 2);
  const num = local.slice(2);
  if (num.length <= 4) return `+55 (${ddd}) ${num}`;
  if (local.length <= 12) {
    // 8-digit landline: (XX) XXXX-XXXX
    if (num.length <= 8) return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
    // 9-digit mobile: (XX) XXXXX-XXXX
    return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5, 9)}`;
  }
  return `+55 ${local}`;
}

function formatInternationalPhone(digits) {
  // Generic: +CC XXXXXXXXX (just group with spaces)
  if (digits.length <= 3) return `+${digits}`;
  const cc = digits.slice(0, digits.length <= 11 ? 2 : 3);
  const rest = digits.slice(cc.length);
  // Group remaining digits in chunks of 3-4
  const chunks = [];
  for (let i = 0; i < rest.length; i += 4) {
    chunks.push(rest.slice(i, i + 4));
  }
  return `+${cc} ${chunks.join(' ')}`;
}

function formatPhone(value) {
  const digits = digitsOnly(value);
  if (!digits) return '';

  // Brazilian number: starts with 55 or no country code (assume BR)
  const isBR = digits.startsWith('55') || (!value.startsWith('+') && digits.length <= 11);

  if (isBR) {
    const brDigits = digits.startsWith('55') ? digits : '55' + digits;
    if (brDigits.length > 13) return formatBrazilPhone(brDigits.slice(0, 13));
    return formatBrazilPhone(brDigits);
  }

  // International: limit to 15 digits (E.164 max)
  const limited = digits.slice(0, 15);
  return formatInternationalPhone(limited);
}

// ── Email validation ──

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateEmail(input) {
  const val = input.value.trim();
  if (!val) {
    input.classList.remove('field-valid', 'field-invalid');
    return;
  }
  if (EMAIL_REGEX.test(val)) {
    input.classList.add('field-valid');
    input.classList.remove('field-invalid');
  } else {
    input.classList.add('field-invalid');
    input.classList.remove('field-valid');
  }
}

// ── Feedback helpers ──

function showFeedback(el, type, message) {
  el.style.display = 'block';
  el.className = `lead-form-feedback lead-form-feedback--${type}`;
  el.textContent = message;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Enviando...' : 'Enviar Mensagem →';
}

// ── Init ──

export function initFormHandler() {
  // Persist UTMs in sessionStorage
  const utms = getUTMParams();
  const hasUtm = utms.utmSource || utms.originId;
  if (hasUtm) {
    sessionStorage.setItem('arena_utm', JSON.stringify(utms));
  }

  // Persist consultant ref in sessionStorage (?ref=<uuid>)
  const consultantRef = getConsultantRef();
  if (consultantRef) {
    sessionStorage.setItem('arena_ref', consultantRef);
  }

  // CTA cards com data-interest pré-selecionam o campo interesse e scrollam ao form
  document.querySelectorAll('[data-interest]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const interest = el.getAttribute('data-interest');
      const select = document.getElementById('lead-interest');
      if (select && interest) {
        select.value = interest;
        // Scroll ao form com highlight visual
        const form = document.getElementById('arena-lead-form');
        if (form) {
          e.preventDefault();
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          select.style.borderColor = '#ffaa00';
          setTimeout(() => { select.style.borderColor = ''; }, 2000);
        }
      }
    });
  });

  const form = document.getElementById('arena-lead-form');
  if (!form) return;

  // Phone auto-format
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const cursorPos = phoneInput.selectionStart;
      const prevLen = phoneInput.value.length;
      phoneInput.value = formatPhone(phoneInput.value);
      // Adjust cursor position after formatting
      const diff = phoneInput.value.length - prevLen;
      phoneInput.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });

    // On focus, add +55 prefix if empty
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value) {
        phoneInput.value = '+55 ';
      }
    });

    // On blur, clear if only prefix
    phoneInput.addEventListener('blur', () => {
      const digits = digitsOnly(phoneInput.value);
      if (digits === '55' || !digits) {
        phoneInput.value = '';
      }
    });
  }

  // Email real-time validation
  const emailInput = form.querySelector('[name="email"]');
  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail(emailInput));
    emailInput.addEventListener('blur', () => validateEmail(emailInput));
  }

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const feedback = document.getElementById('lead-form-feedback');
    const submitBtn = document.getElementById('lead-form-submit');

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const rawPhone = form.querySelector('[name="phone"]').value.trim();
    const phone = rawPhone ? '+' + digitsOnly(rawPhone) : '';
    const interest = form.querySelector('[name="interest"]').value;
    const message = form.querySelector('[name="message"]').value.trim();

    // Validation
    if (!name) {
      showFeedback(feedback, 'error', 'Por favor, informe seu nome.');
      form.querySelector('[name="name"]').focus();
      return;
    }
    if (!email) {
      showFeedback(feedback, 'error', 'Por favor, informe seu e-mail.');
      form.querySelector('[name="email"]').focus();
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      showFeedback(feedback, 'error', 'E-mail inválido. Verifique o endereço informado.');
      form.querySelector('[name="email"]').focus();
      return;
    }

    // Merge stored UTMs (from landing) with current ones
    const storedUtms = JSON.parse(sessionStorage.getItem('arena_utm') || '{}');
    const finalUtms = { ...storedUtms, ...getUTMParams() };
    Object.keys(finalUtms).forEach((k) => {
      if (!finalUtms[k]) delete finalUtms[k];
    });

    // Consultant ref: prioriza URL atual, fallback para sessionStorage.
    // Pode ser UUID ou referralCode — o backend resolve ambos via /webhooks/site.
    const consultantRef = getConsultantRef() || sessionStorage.getItem('arena_ref') || undefined;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = consultantRef && UUID_REGEX.test(consultantRef);

    const payload = {
      name,
      email,
      phone: phone || undefined,
      interest: interest || undefined,
      message: message || undefined,
      ...finalUtms,
      consultantId: isUuid ? consultantRef : undefined,
      referralCode: !isUuid ? consultantRef : undefined,
    };

    setLoading(submitBtn, true);
    feedback.style.display = 'none';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (SITE_WEBHOOK_SECRET) {
        headers['X-Webhook-Secret'] = SITE_WEBHOOK_SECRET;
      }
      const res = await fetch(`${API_URL}/webhooks/site`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro no servidor');
      }

      showFeedback(feedback, 'success', 'Mensagem enviada com sucesso! Em breve entraremos em contato.');
      trackLead(interest, finalUtms.utmSource);
      form.reset();
      // Clear validation classes
      emailInput?.classList.remove('field-valid', 'field-invalid');
    } catch (err) {
      console.error('Lead form error:', err);
      showFeedback(feedback, 'error', 'Erro ao enviar. Tente novamente ou entre em contato por e-mail.');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}
