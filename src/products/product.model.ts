import { Table, Model, Column, Unique, DataType } from 'sequelize-typescript';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IUnit } from './types';

export enum Unit {
  PIECE = 'шт',
  TON = 'тон',
  M = 'метр',
  KG = 'кг',
  SET = 'набор',
  L = 'литр',
  GR = 'гр',
  MM = 'мм',
  CM = 'см',
  KM = 'км',
}

@Table
export class Product extends Model {
  @Unique
  @Column(DataType.TEXT)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Unique
  @Column(DataType.TEXT)
  @IsNotEmpty()
  @IsString()
  azencoCode: string;

  @Column(DataType.DECIMAL(20, 2))
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Column(DataType.TEXT)
  @IsString()
  type: string;

  @Column(
    DataType.ENUM(
      Unit.PIECE,
      Unit.TON,
      Unit.M,
      Unit.KG,
      Unit.SET,
      Unit.L,
      Unit.GR,
      Unit.MM,
      Unit.CM,
      Unit.KM,
    ),
  )
  @IsString()
  unit: IUnit;

  @Column(DataType.TEXT)
  @IsString()
  img: string;
}
