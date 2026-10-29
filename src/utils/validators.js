/** Signup endings. Edit this list in one place. */
export const ALLOWED_TLDS = [
  'com',
  'pk',
  'net',
  'org',
  'edu',
  'gov',
  'info',
  'co',
  'io',
  'ae',
  'sa',
  'uk',
  'in',
  'us',
  'ca',
  'au',
  'de',
  'fr',
  'tr',
  'my',
  'sg',
];

export function isValidEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  if (!email || /\s/.test(email)) return false;
  if (!/^[a-z]/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!/^[a-z0-9._-]+$/.test(local)) return false;
  if (local.endsWith('.') || local.includes('..')) return false;
  if (!domain.includes('.')) return false;
  const labels = domain.split('.');
  for (const label of labels) {
    if (!/^[a-z0-9-]+$/.test(label)) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
  }
  return ALLOWED_TLDS.includes(labels[labels.length - 1]);
}

/** Digits only, at most 11. A paste that starts with the dial code drops that prefix. */
export function nationalDigits(raw, previous, dial) {
  const text = String(raw ?? '');
  const prior = String(previous ?? '');
  const pasted = text.length - prior.length > 1 || /[^\d]/.test(text);
  if (!pasted) {
    return text.replace(/\D/g, '').slice(0, 11);
  }
  let cleaned = text.replace(/[\s()[\]+-]/g, '');
  if (dial && cleaned.startsWith(dial)) {
    cleaned = cleaned.slice(dial.length);
  }
  return cleaned.replace(/\D/g, '').slice(0, 11);
}

export function phoneError(national, dial, iso) {
  if (!national) return '';
  if (iso === 'PK') {
    const ok = /^03\d{9}$/.test(national) || /^3\d{9}$/.test(national);
    return ok ? '' : 'Enter a valid phone number (03XX XXXXXXX)';
  }
  if (!/^\d{7,11}$/.test(national)) return 'Enter a valid phone number';
  const rest = national.replace(/^0+/, '');
  const total = `${dial}${rest}`;
  if (!rest || total.length < 10 || total.length > 15) {
    return 'Enter a valid phone number';
  }
  return '';
}

export function toInternational(national, dial) {
  if (!national) return null;
  const rest = national.replace(/^0+/, '');
  if (!rest) return null;
  return `+${dial}${rest}`;
}
