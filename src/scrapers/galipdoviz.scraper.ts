import { RateData } from '@/helpers/exchange_scrape.helper';

export function scrapeGalipDoviz(): RateData {
  const results: RateData = {};
  const rows = document.querySelectorAll('table tr');

  rows.forEach(row => {
    const img = row.querySelector('img');
    const buyEl = row.querySelectorAll('td')[1]?.querySelector('div');
    const sellEl = row.querySelectorAll('td')[2]?.querySelector('div');

    if (img && buyEl && sellEl) {
      const altText = img.getAttribute('src')?.toLowerCase();
      let currency: string | undefined;

      if (altText?.includes('dolar')) {
        currency = 'USD';
      } else if (altText?.includes('euro')) {
        currency = 'EUR';
      } else if (altText?.includes('sterlin')) {
        currency = 'GBP';
      }

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
