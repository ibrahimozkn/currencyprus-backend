import { RateData } from '@/helpers/exchange_scrape.helper';

export function scrapeSunDoviz(): RateData {
  const results: RateData = {};
  const rows = document.querySelectorAll('table tbody tr');
  console.log(rows);

  rows.forEach((row, index) => {
    if (index < 3) return;

    const cells = row.querySelectorAll('td');
    if (cells.length < 3) return;

    const currencyText = cells[0].textContent?.trim();
    const buyEl = cells[1].textContent?.trim();
    const sellEl = cells[2].textContent?.trim();

    console.log(currencyText);
    console.log(buyEl);
    console.log(sellEl);

    if (currencyText && buyEl && sellEl) {
      let currency: string | undefined;

      if (currencyText?.includes('USD')) {
        currency = 'USD';
      } else if (currencyText?.includes('EUR')) {
        currency = 'EUR';
      } else if (currencyText?.includes('GBP')) {
        currency = 'GBP';
      } else if (currencyText?.includes('AUD')) {
        currency = 'AUD';
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
