/** TZ NIDA display: digit groups 8 · 5 · 5 · 2 (hyphen-separated). */
const NIDA_LENS = [8, 5, 5, 2] as const;
const DIGITS_TOTAL = NIDA_LENS.reduce((a, b) => a + b, 0);

export const stripNidaToDigits = (raw: string) => raw.replace(/\D/g, "").slice(0, DIGITS_TOTAL);

export const formatNidaInput = (raw: string): string => {
  const d = stripNidaToDigits(raw);
  const parts: string[] = [];
  let i = 0;
  for (const len of NIDA_LENS) {
    if (i >= d.length) break;
    parts.push(d.slice(i, i + len));
    i += len;
  }
  return parts.join("-");
};

export const isCompleteNida = (formatted: string) =>
  /^(\d{8}-\d{5}-\d{5}-\d{2})$/.test(formatted.trim());
