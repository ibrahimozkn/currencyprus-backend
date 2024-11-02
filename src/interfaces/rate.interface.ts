import { Exchange, ExchangeType } from './exchange.interface';

export interface Rate {
  id: number;
  exchange: Exchange;
  currency: string;
  rate: number;
  date: Date;
  type: ExchangeType;
}
