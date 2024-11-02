import cron from 'node-cron';
import { ExchangeScraper } from './helpers/exchange_scrape.helper';

const scraper = new ExchangeScraper();
let isScraping = false;

export async function scheduleScraping() {
  try {
    await scraper.init();
  } catch (error) {
    console.error('Error initializing scraper:', error);
    process.exit(1);
  }

  cron.schedule('* * * * *', async () => {
    if (isScraping) {
      console.log('Skipping job as another job is already running.');
      return;
    }

    console.log('Running scheduled exchange scraping...');
    isScraping = true;
    try {
      await scraper.scrapeAllExchanges();
    } catch (error) {
      console.error('Error during scheduled scraping:', error);
    } finally {
      isScraping = false;
    }
  });

  // Ensure the scraper is closed when the process exits
  process.on('exit', async () => {
    try {
      await scraper.close();
    } catch (error) {
      console.error('Error closing scraper on exit:', error);
    }
  });
}
