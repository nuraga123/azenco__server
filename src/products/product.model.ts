import { Table, Model, Column, Unique, DataType } from 'sequelize-typescript';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @Column(DataType.TEXT)
  @IsString()
  unit: string;

  @Column(DataType.TEXT)
  @IsString()
  img: string;
}
