import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Rate } from '@interfaces/rate.interface';
import { RatesService } from '@services/rates.service';
import { CreateRateDto } from '@/dtos/rate.dto';

export class RatesController {
  public rates = Container.get(RatesService);

  public getRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllRatesData: Rate[] = await this.rates.getRates();

      res.status(200).json({ data: findAllRatesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getRateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateId = Number(req.params.id);
      const findOneRateData: Rate = await this.rates.getRateById(rateId);

      res.status(200).json({ data: findOneRateData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateData: CreateRateDto = req.body;
      const createRateData: Rate = await this.rates.createRate(rateData);

      res.status(201).json({ data: createRateData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
