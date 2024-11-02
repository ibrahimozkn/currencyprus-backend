import { IsString, IsInt, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateExchangeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsUrl()
  @IsNotEmpty()
  website: string;

  @IsString()
  @IsNotEmpty()
  exchangeSite: string;
}

export class UpdateExchangeDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsUrl()
  @IsNotEmpty()
  website?: string;

  @IsString()
  @IsNotEmpty()
  exchangeSite?: string;
}
