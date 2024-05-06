import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { IUnit } from '../types';

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  azencoCode?: string;

  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  type?: string;

  @IsNotEmpty()
  @IsString()
  unit?: IUnit;

  @IsNotEmpty()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  img?: string;
}
