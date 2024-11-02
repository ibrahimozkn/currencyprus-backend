// src/scrapers/limasol.ts
export default function (): Record<string, { buy?: string; sell?: string }> {
  const results: Record<string, { buy?: string; sell?: string }> = {};
  const items = document.querySelectorAll('.exchange-rates__item');

  items.forEach(item => {
    const currencyEl = item.querySelector('.exchange-rates__item__name');
    const buyEl = item.querySelector('.exchange-rates__item__buy');
    const sellEl = item.querySelector('.exchange-rates__item__sell');

    if (currencyEl && buyEl && sellEl) {
      const currencyText = currencyEl.textContent?.trim();
      let currency: string | undefined;

      if (currencyText?.includes('€')) currency = 'EUR';
      else if (currencyText?.includes('£')) currency = 'GBP';
      else if (currencyText?.includes('$')) currency = 'USD';

      if (currency) {
        results[currency] = {
          buy: buyEl.textContent?.trim(),
          sell: sellEl.textContent?.trim(),
        };
      }
    }
  });

  return results;
}
