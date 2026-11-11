/** Polish plural form: 1 osoba / 2–4 osoby / 5+ osób (12–14 take the "many" form). */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const last = n % 10;
  const tens = n % 100;
  if (last >= 2 && last <= 4 && (tens < 12 || tens > 14)) return few;
  return many;
}
