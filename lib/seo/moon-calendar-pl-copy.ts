/**
 * Pure Polish SEO copy for the moon-calendar page. Lives in `lib/seo` (not
 * in the page component) so unit tests can import it without pulling the
 * page's component tree (`SmartHeader` → server actions → database).
 */

export const moonCalendarPlCopy = (year: number) => ({
  title: `Kalendarz Księżycowy ${year}: Fazy Księżyca i Znak Zodiaku Dzisiaj`,
  description: `Kalendarz księżycowy na rok ${year}: aktualna faza księżyca, stopień oświetlenia, znak zodiaku, daty pełni i nowiu oraz prognoza księżycowa na 30 dni.`,
});
