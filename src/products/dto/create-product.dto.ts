import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { IUnit } from '../types';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly azencoCode: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsNotEmpty()
  @IsString()
  readonly unit: IUnit;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsString()
  readonly img: string;
}
