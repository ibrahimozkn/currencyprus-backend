import cron from 'node-cron';
import { RateScrapeHelper } from './helpers/exchange_scrape.helper';

export async function scheduleScraping() {
  cron.schedule('* * * * *', async () => {
    console.log('Running a task every minute');
    const scraper = new RateScrapeHelper();
    await scraper.init();
  });
}
