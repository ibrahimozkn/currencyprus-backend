import { ExchangeType } from '@prisma/client';
import { Rate } from './rate.interface';

export interface Exchange {
  id: number;
  name: string;
  location: string;
  website: string;
  exchangeSite: string;
  rates?: Rate[];
}

export { ExchangeType };
