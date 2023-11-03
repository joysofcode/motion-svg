export function formatNumber(number: number, { digits = 0, lang = 'en' } = {}) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(number)
}
