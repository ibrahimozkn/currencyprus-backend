import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { ExchangeType } from '@/interfaces/exchange.interface';
import axios from 'axios';
import https from 'https';
import { scrapeLimasolBank } from '@/scrapers/limasolbank.scraper';
import { scrapeGalipDoviz } from '@/scrapers/galipdoviz.scraper';
import { scrapeSunDoviz } from '@/scrapers/sundoviz.scraper';
import { cleanWebsiteString } from './cleanWebsiteString';
import { scrapeIktisatBank } from '@/scrapers/iktisatbank.scraper';

export type RateData = Record<string, { buy?: string; sell?: string }>;

export class ExchangeScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private prisma = new PrismaClient();
  private httpsAgent = new https.Agent({ rejectUnauthorized: false });
  private readonly maxRetries = 4;
  private readonly retryTimeout = 90000;

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async init() {
    try {
      this.browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
      this.page = await this.browser.newPage();
      console.log('Browser initialized successfully.');
    } catch (error) {
      console.error('Error initializing browser:', error);
      throw new Error('Browser initialization failed.');
    }
  }

  async scrapeAllExchanges() {
    try {
      const exchanges = await this.prisma.exchange.findMany();
      const scrapeTasks = exchanges.map(exchange => this.scrapeExchangeSafely(exchange.id));
      await Promise.allSettled(scrapeTasks);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    }
  }

  private async scrapeExchangeSafely(exchangeId: number) {
    try {
      console.log(`Starting to scrape exchange with ID ${exchangeId}`);
      await this.scrapeAndStore(exchangeId);
    } catch (error) {
      console.error(`Failed to scrape exchange with ID ${exchangeId}:`, error);
    }
  }

  async scrapeAndStore(exchangeId: number) {
    if (!this.page) throw new Error('Scraper not initialized. Call init() first.');

    const exchange = await this.prisma.exchange.findUnique({ where: { id: exchangeId } });
    if (!exchange) throw new Error(`Exchange with ID ${exchangeId} not found`);

    if (!(await this.isUrlAccessible(exchange.exchangeSite))) {
      console.warn(`Exchange website ${exchange.exchangeSite} is not accessible`);
      return;
    }

    await this.retryGoto(exchange.exchangeSite);
    const rates = await this.scrapeRates(exchange.exchangeSite);
    await this.storeRates(exchange.id, rates);
    console.log(`Scraped rates successfully for exchange ID ${exchangeId}`);
  }

  private async storeRates(exchangeId: number, rates: RateData) {
    const storeTasks = Object.entries(rates).map(async ([currency, data]) => {
      if (data.buy) await this.storeRate(exchangeId, currency, data.buy, ExchangeType.BUY);
      if (data.sell) await this.storeRate(exchangeId, currency, data.sell, ExchangeType.SELL);
    });
    await Promise.all(storeTasks);
  }

  private async storeRate(exchangeId: number, currency: string, rate: string, type: ExchangeType) {
    console.log(`Storing rate for ${currency} ${type.toLowerCase()} at ${rate} for ${exchangeId}...`);
    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate)) return;

    const recentRate = await this.prisma.rate.findFirst({
      where: { exchangeId, currency, type },
      orderBy: { date: 'desc' },
    });

    const isNewRate = !recentRate || recentRate.rate !== parsedRate || recentRate.date <= new Date(Date.now() - 3600000);
    if (isNewRate) {
      await this.prisma.rate.create({
        data: {
          exchangeId,
          currency,
          rate: parsedRate,
          type,
          date: new Date(),
        },
      });
    } else {
      console.log(`Skipping duplicate rate for ${currency} ${type.toLowerCase()} at ${rate} for ${exchangeId}`);
    }
  }

  private async scrapeRates(website: string): Promise<RateData> {
    if (!this.page) throw new Error('Page not initialized');

    const hostname = cleanWebsiteString(new URL(website).hostname);
    console.log(`Scraping rates for ${hostname}...`);

    switch (hostname) {
      case 'limasolbank.com.tr':
        return await this.page.evaluate(scrapeLimasolBank);
      case 'galipdoviz.com':
        return await this.page.evaluate(scrapeGalipDoviz);
      case 'sun.portburda.com':
        return await this.page.evaluate(scrapeSunDoviz);
      case 'iktisatbank.com':
        return await this.page.evaluate(scrapeIktisatBank);
      default:
        throw new Error(`Scraping not implemented for ${hostname}`);
    }
  }

  private async retryGoto(url: string): Promise<void> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.page!.goto(url, { waitUntil: 'networkidle', timeout: this.retryTimeout });
        console.log(`Successfully navigated to ${url} on attempt ${attempt}`);
        return;
      } catch (error) {
        console.log(`Attempt ${attempt} to navigate to ${url} failed. Retrying...`);

        if (attempt < this.maxRetries) {
          console.log(`Waiting for ${this.retryTimeout / 4} milliseconds before retrying...`);
          await this.delay(this.retryTimeout / 4);
        }
        if (attempt === this.maxRetries) {
          console.error(`Failed to navigate to ${url} after ${this.maxRetries} attempts`);
          throw new Error(`Navigation to ${url} failed after ${this.maxRetries} attempts`);
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
