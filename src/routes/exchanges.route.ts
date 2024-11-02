import { Router } from 'express';
import { CreateExchangeDto, UpdateExchangeDto } from '@dtos/exhange.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { ExchangeController } from '@/controllers/exchanges.controller';

export class ExchangeRoute implements Routes {
  public path = '/exchanges';
  public router = Router();
  public exchange = new ExchangeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.exchange.getExchanges);
    this.router.get(`${this.path}/:id(\\d+)`, this.exchange.getExchangeById);
    this.router.get(`${this.path}/name/:name`, this.exchange.getExchangeByName);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateExchangeDto), this.exchange.createExchange);
    this.router.put(`${this.path}/:id(\\d+)`, ValidationMiddleware(UpdateExchangeDto), this.exchange.updateExchange);
    this.router.delete(`${this.path}/:id(\\d+)`, this.exchange.deleteExchange);
  }
}
