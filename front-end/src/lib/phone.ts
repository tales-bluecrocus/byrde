/**
 * Phone utilities — shared by Wizard, SiteSettingsPanel, and anywhere
 * that needs to format or strip a phone number.
 */

/**
 * Convert display phone to tel:-compatible raw format.
 * Preserves leading + for international numbers.
 *
 * Examples:
 *   "(208) 998-0054"     → "2089980054"
 *   "+1 479-877-5803"    → "+14798775803"
 *   "+55 (11) 99999-0000" → "+5511999990000"
 */
export function phoneToRaw(phone: string): string {
  const t = phone.trim();
  if (!t) return '';
  const hasPlus = t.startsWith('+');
  const digits = t.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Format phone as user types: (123) 456-7890 or +1 (234) 567-8901.
 * Keeps raw digits (plus optional leading +) and applies mask on the fly.
 */
export function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  // International: +N (NNN) NNN-NNNN
  if (hasPlus) {
    const cc = digits.slice(0, 1);
    const area = digits.slice(1, 4);
    const pre = digits.slice(4, 7);
    const line = digits.slice(7, 11);

    if (digits.length <= 1) return `+${cc}`;
    if (digits.length <= 4) return `+${cc} (${area}`;
    if (digits.length <= 7) return `+${cc} (${area}) ${pre}`;
    return `+${cc} (${area}) ${pre}-${line}`;
  }

  // Domestic: (NNN) NNN-NNNN
  const area = digits.slice(0, 3);
  const pre = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length <= 3) return `(${area}`;
  if (digits.length <= 6) return `(${area}) ${pre}`;
  return `(${area}) ${pre}-${line}`;
}

/**
 * Strip non-digit chars (keep leading +), cap length, then format.
 * Use as the onChange handler for phone inputs.
 */
export function handlePhoneInput(value: string): { phone: string; phone_raw: string } {
  const stripped = value.replace(/[^0-9+]/g, '');
  const maxDigits = stripped.startsWith('+') ? 12 : 10;
  const capped = stripped.slice(0, maxDigits);
  const phone = formatPhone(capped);
  return { phone, phone_raw: phoneToRaw(phone) };
}
