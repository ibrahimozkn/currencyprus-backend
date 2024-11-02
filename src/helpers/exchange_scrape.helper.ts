import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { ExchangeType } from '@/interfaces/exchange.interface';
import axios from 'axios';
import https from 'https';

export class ExchangeScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private prisma = new PrismaClient();
  private httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Custom HTTPS agent

  async init() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--ignore-certificate-errors'], // Bypass SSL errors in Playwright
      });
      this.page = await this.browser.newPage();
      console.log('Browser initialized successfully.');
    } catch (error) {
      console.error('Error initializing browser:', error);
      process.exit(1); // Exit if initialization fails
    }
  }

  async scrapeAllExchanges() {
    try {
      const exchanges = await this.prisma.exchange.findMany();
      console.log(`Found ${exchanges.length} exchanges to scrape.`);

      for (const exchange of exchanges) {
        try {
          console.log(`Starting to scrape exchange with ID ${exchange.id}`);
          await this.scrapeAndStore(exchange.id);
        } catch (error) {
          console.error(`Failed to scrape exchange with ID ${exchange.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    }
  }

  async scrapeAndStore(exchangeId: number) {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.');
    }

    try {
      const exchange = await this.prisma.exchange.findUnique({
        where: { id: exchangeId },
      });

      if (!exchange) {
        throw new Error(`Exchange with ID ${exchangeId} not found`);
      }

      const isAccessible = await this.isUrlAccessible(exchange.website);
      if (!isAccessible) {
        throw new Error(`Exchange website ${exchange.website} is not accessible`);
      }

      await this.retryGoto(this.page, exchange.website);

      const rates = await this.scrapeRates(exchange.website);

      for (const [currency, data] of Object.entries(rates)) {
        if (data.buy) {
          await this.prisma.rate.create({
            data: {
              exchangeId: exchange.id,
              currency,
              rate: parseFloat(data.buy),
              type: ExchangeType.BUY,
              date: new Date(),
            },
          });
        }

        if (data.sell) {
          await this.prisma.rate.create({
            data: {
              exchangeId: exchange.id,
              currency,
              rate: parseFloat(data.sell),
              type: ExchangeType.SELL,
              date: new Date(),
            },
          });
        }
      }

      console.log(`Scraped rates successfully for exchange ID ${exchangeId}`);
      return rates;
    } catch (error) {
      console.error(`Error scraping exchange ${exchangeId}:`, error);
      throw error;
    }
  }

  private async scrapeRates(website: string): Promise<Record<string, { buy?: string; sell?: string }>> {
    if (!this.page) throw new Error('Page not initialized');

    const hostname = new URL(website).hostname;
    console.log(`Scraping rates for ${hostname}...`);

    return await this.page.evaluate(hostname => {
      const results: Record<string, { buy?: string; sell?: string }> = {};
      const doc = document;

      if (hostname === 'www.limasolbank.com.tr') {
        const items = doc.querySelectorAll('.exchange-rates__item');

        items.forEach(item => {
          const currencyEl = item.querySelector('.exchange-rates__item__name');
          const buyEl = item.querySelector('.exchange-rates__item__buy');
          const sellEl = item.querySelector('.exchange-rates__item__sell');

          if (currencyEl && buyEl && sellEl) {
            const currencyText = currencyEl.textContent?.trim();
            let currency: string | undefined;

            if (currencyText?.includes('€')) {
              currency = 'EUR';
            } else if (currencyText?.includes('£')) {
              currency = 'GBP';
            } else if (currencyText?.includes('$')) {
              currency = 'USD';
            }

            if (currency) {
              results[currency] = {
                buy: buyEl.textContent?.trim(),
                sell: sellEl.textContent?.trim(),
              };
            }
          }
        });
      } else if (hostname === 'galipdoviz.com') {
        const rows = doc.querySelectorAll('table tr');

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
      }

      return results;
    }, hostname);
  }

  private async retryGoto(page: Page, url: string, maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); // Increased timeout to 60 seconds
        console.log(`Successfully navigated to ${url} on attempt ${attempt}`);
        return;
      } catch (error) {
        console.log(`Attempt ${attempt} to navigate to ${url} failed. Retrying...`);
        if (attempt === maxRetries) {
          console.error(`Failed to navigate to ${url} after ${maxRetries} attempts`);
          throw error;
        }
      }
    }
  }

  private async isUrlAccessible(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { httpsAgent: this.httpsAgent, timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn(`URL ${url} is not accessible:`, error.message);
      return false;
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('Browser closed successfully.');
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    } finally {
      this.browser = null;
      this.page = null;
      await this.prisma.$disconnect();
      console.log('Prisma client disconnected.');
    }
  }
}
