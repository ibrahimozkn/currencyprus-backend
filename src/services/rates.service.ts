import { CreateRateDto } from '@/dtos/rate.dto';
import { Rate } from '@/interfaces/rate.interface';
import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class RatesService {
  public rates = new PrismaClient().rate;
  public async getRates(): Promise<Rate[]> {
    const rates = await this.rates.findMany({
      include: {
        exchange: true,
      },
    });

    return rates;
  }

  public async getRateById(rateId: number): Promise<Rate> {
    const rate = await this.rates.findUnique({
      where: { id: rateId },
      include: {
        exchange: true,
      },
    });

    return rate;
  }

  public async createRate(rateData: CreateRateDto): Promise<Rate> {
    const { exchangeId, ...restData } = rateData;
    const rate = await this.rates.create({
      data: {
        ...restData,
        exchange: { connect: { id: exchangeId } },
      },
      include: {
        exchange: true,
      },
    });

    return rate;
  }
}
