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
