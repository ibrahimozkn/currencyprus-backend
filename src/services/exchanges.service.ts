import { CreateExchangeDto, UpdateExchangeDto } from '@/dtos/exhange.dto';
import { HttpException } from '@/exceptions/httpException';
import { Exchange } from '@/interfaces/exchange.interface';
import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';

@Service()
export class ExchangesService {
  public exchanges = new PrismaClient().exchange;

  public async findAllExchanges(): Promise<Exchange[]> {
    const allExchanges = await this.exchanges.findMany();
    return allExchanges;
  }

  public async findExchangeById(exchangeId: number): Promise<Exchange> {
    const findExchange = await this.exchanges.findUnique({ where: { id: exchangeId } });
    if (!findExchange) throw new HttpException(409, "Exchange doesn't exist");

    return findExchange;
  }

  public async createExchange(exchangeData: CreateExchangeDto): Promise<Exchange> {
    const findExchange = await this.exchanges.findUnique({ where: { name: exchangeData.name } });

    if (findExchange) throw new HttpException(409, `Exchange ${exchangeData.name} already exists`);

    const createExchange = await this.exchanges.create({ data: exchangeData });

    return createExchange;
  }

  public async updateExchange(exchangeId: number, exchangeData: UpdateExchangeDto): Promise<Exchange> {
    const findExchange = await this.exchanges.findUnique({ where: { id: exchangeId } });
    if (!findExchange) throw new HttpException(409, "Exchange doesn't exist");

    const updateExchange = await this.exchanges.update({ where: { id: exchangeId }, data: exchangeData });

    return updateExchange;
  }

  public async deleteExchange(exchangeId: number): Promise<Exchange> {
    const findExchange = await this.exchanges.findUnique({ where: { id: exchangeId } });
    if (!findExchange) throw new HttpException(409, "Exchange doesn't exist");

    const deleteExchange = await this.exchanges.delete({ where: { id: exchangeId } });

    return deleteExchange;
  }

  public async findExchangeByName(exchangeName: string): Promise<Exchange> {
    const findExchange = await this.exchanges.findUnique({ where: { name: exchangeName } });
    if (!findExchange) throw new HttpException(409, "Exchange doesn't exist");

    return findExchange;
  }
}
