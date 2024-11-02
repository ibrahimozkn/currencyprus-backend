import { RateData } from '@/helpers/exchange_scrape.helper';

export function scrapeIktisatBank(): RateData {
  const results: RateData = {};
  const rows = document.querySelectorAll('tbody#dovizData tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const currencyText = cells[0]?.textContent?.trim();
    const buyEl = cells[1]?.textContent?.trim();
    const sellEl = cells[2]?.textContent?.trim();

    if (currencyText && buyEl && sellEl) {
      let currency: string | undefined;

      if (currencyText?.includes('dolar') || currencyText?.includes('USD')) {
        currency = 'USD';
      } else if (currencyText?.includes('euro') || currencyText?.includes('EUR')) {
        currency = 'EUR';
      } else if (currencyText?.includes('sterlin') || currencyText?.includes('GBP')) {
        currency = 'GBP';
      }

      if (currency) {
        results[currency] = {
          buy: buyEl,
          sell: sellEl,
        };
      }
    }
  });

  return results;
}
