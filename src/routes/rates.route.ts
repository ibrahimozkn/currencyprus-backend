import { Router } from 'express';
import { CreateRateDto } from '@dtos/rate.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { RatesController } from '@/controllers/rates.controller';

export class RateRoute implements Routes {
  public path = '/rates';
  public router = Router();
  public rate = new RatesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.rate.getRates);
    this.router.get(`${this.path}/:id(\\d+)`, this.rate.getRateById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateRateDto), this.rate.createRate);
  }
}
