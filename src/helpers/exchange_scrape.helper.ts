import { Exchange } from '@/interfaces/exchange.interface';
import { ExchangeType, PrismaClient } from '@prisma/client';
import { chromium, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import { cleanWebsiteString } from './cleanWebsiteString';
import { Rate } from '@/interfaces/rate.interface';
import { currencies } from '@/constants';

export class RateScrapeHelper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private prisma: PrismaClient = new PrismaClient();
  private websites: Exchange[] = [];

  public async init() {
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext();
    await this.scrapeWebsites();
    await this.browser.close();
  }

  private async scrapeWebsites() {
    this.websites = await this.prisma.exchange.findMany();
    for (const website of this.websites) {
      await this.scrapeWebsite(website);
    }
  }

  private async scrapeWebsite(website: Exchange) {
    const page = await this.createPage();
    if (!page) return;

    try {
      await page.goto(website.exchangeSite, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      const cleanUrl = cleanWebsiteString(website.exchangeSite);
      switch (cleanUrl) {
        case 'galipdoviz.com':
          await this.scrapeGalipDoviz(page, website);
          break;
        case 'limasolbank.com.tr':
          await this.scrapeLimasolBank(page, website);
          break;
        default:
          await this.generalScraper(page, website);
          break;
      }
    } catch (error) {
      console.error(`Error during scraping ${website.exchangeSite}:`, error);
    } finally {
      await page.close();
    }
  }

  private async scrapeGalipDoviz(page: Page, website: Exchange) {
    const rows = await page.$$('tr');

    for (const row of rows) {
      const columns = await row.$$('td');

      if (columns.length < 3) {
        continue;
      }

      let currencyName = '';
      try {
        currencyName = (await columns[0].$eval('img', img => img.getAttribute('src')?.split('.')[0])) || 'Unknown';
      } catch (e) {
        continue;
      }

      const buyRate = await columns[1].innerText();
      const sellRate = await columns[2].innerText();

      const currency = this.getCurrencyName(currencyName);

      if (!currency) continue;

      this.saveRates(currency, buyRate, sellRate, website);
    }
  }

  private async scrapeLimasolBank(page: Page, website: Exchange) {
    console.log('Scraping Limasol Bank');
    const rateItems = await page.$$('.exchange-rates__item');

    for (const element of rateItems) {
      const currencyName = await element.$eval('.exchange-rates__item__name', el => el.textContent?.trim() || '');
      const buyRate = await element.$eval('.exchange-rates__item__buy', el => el.textContent?.trim() || '');
      const sellRate = await element.$eval('.exchange-rates__item__sell', el => el.textContent?.trim() || '');
      await this.saveRates(currencyName, buyRate, sellRate, website);
    }
  }

  private async generalScraper(page: Page, website: Exchange) {
    console.log('Scraping General Website', website.exchangeSite);
    const rows = await page.$$('tr');
    await this.extractRatesFromRows(rows, website);
  }

  private async extractRatesFromRows(rows: ElementHandle<Element>[], website: Exchange) {
    for (const row of rows) {
      const columns = await row.$$('td');
      if (columns.length < 3) continue;

      const currencyName = await columns[0].innerText();
      const buyRate = await columns[1].innerText();
      const sellRate = await columns[2].innerText();

      await this.saveRates(currencyName, buyRate, sellRate, website);
    }
  }

  private async saveRates(currencyName: string, buyRate: string, sellRate: string, website: Exchange) {
    const currency = this.getCurrencyName(currencyName);
    if (!currency) return;

    await this.saveRateToDatabase(currency, parseFloat(buyRate), website, ExchangeType.BUY);
    await this.saveRateToDatabase(currency, parseFloat(sellRate), website, ExchangeType.SELL);
  }

  private async saveRateToDatabase(currency: string, rateValue: number, website: Exchange, type: ExchangeType) {
    console.log(`Saving rate for ${website.name} - ${currency} - ${type} - ${rateValue}`);
    const latestRate = await this.prisma.rate.findFirst({
      where: {
        exchangeId: website.id,
        currency,
        type,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!latestRate || latestRate.rate !== rateValue || latestRate.date < new Date(Date.now() - 1000 * 60 * 60)) {
      await this.prisma.rate.create({
        data: {
          exchange: {
            connect: {
              id: website.id,
            },
          },
          currency,
          rate: rateValue,
          date: new Date(),
          type,
        },
      });
    }
  }

  private getCurrencyName(currency: string) {
    const trimmedCurrency = currency.trim().replace(' ', '');
    if (currencies.has(trimmedCurrency)) {
      return trimmedCurrency;
    }
    return Array.from(currencies.entries()).find(([key, synonyms]) => synonyms.some(s => s.toLowerCase() === currency.toLowerCase()))?.[0];
  }

  private async createPage(): Promise<Page | null> {
    if (!this.context) {
      console.error('Browser context is not available');
      return null;
    }
    return await this.context.newPage();
  }
}
