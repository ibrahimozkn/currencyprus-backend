import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Exchange } from '@interfaces/exchange.interface';
import { ExchangesService } from '@services/exchanges.service';
import { CreateExchangeDto, UpdateExchangeDto } from '@/dtos/exhange.dto';

export class ExchangeController {
  public exchange = Container.get(ExchangesService);

  public getExchanges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllExchangesData: Exchange[] = await this.exchange.findAllExchanges();
      res.status(200).json({ data: findAllExchangesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getExchangeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exchangeId = Number(req.params.id);
      const findOneExchangeData: Exchange = await this.exchange.findExchangeById(exchangeId);
      res.status(200).json({ data: findOneExchangeData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exchangeData: CreateExchangeDto = req.body;
      const createExchangeData: Exchange = await this.exchange.createExchange(exchangeData);
      res.status(201).json({ data: createExchangeData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exchangeId = Number(req.params.id);
      const exchangeData: UpdateExchangeDto = req.body;
      const updateExchangeData: Exchange = await this.exchange.updateExchange(exchangeId, exchangeData);
      res.status(200).json({ data: updateExchangeData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exchangeId = Number(req.params.id);
      const deleteExchangeData: Exchange = await this.exchange.deleteExchange(exchangeId);
      res.status(200).json({ data: deleteExchangeData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getExchangeByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exchangeName = String(req.params.name);
      const findOneExchangeData: Exchange = await this.exchange.findExchangeByName(exchangeName);
      res.status(200).json({ data: findOneExchangeData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}
