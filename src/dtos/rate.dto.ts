import { IsNumber, IsString, IsEnum, IsDate } from 'class-validator';
import { ExchangeType } from '@prisma/client';

export class CreateRateDto {
  @IsNumber()
  exchangeId: number;

  @IsString()
  currency: string;

  @IsNumber()
  rate: number;

  @IsEnum(ExchangeType)
  type: ExchangeType;

  @IsDate()
  date: Date;
}

export class UpdateRateDto extends CreateRateDto {}
