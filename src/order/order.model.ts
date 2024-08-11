import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { StatusOrderType } from './types';
import { IsString } from 'class-validator';

@Table
export class Order extends Model<Order> {
  @Column(DataType.TEXT)
  status: StatusOrderType;

  // заказчик и складчик
  @Column(DataType.INTEGER)
  clientId: number;

  @Column(DataType.TEXT)
  clientUserName: string;

  @Column(DataType.TEXT)
  clientMessage?: string;

  @Column(DataType.TEXT)
  barnUsername: string;

  @Column(DataType.INTEGER)
  barnUserId: number;

  @Column(DataType.TEXT)
  BarnUserMessage?: string;

  // амбар
  @Column(DataType.INTEGER)
  barnId: number;

  // продукт
  @Column(DataType.TEXT)
  productName: string;

  @Column(DataType.STRING)
  azencoCode: string;

  // количество новых товаров
  @Column(DataType.DECIMAL(20, 3))
  newStock: number;

  // количество использованных товаров
  @Column(DataType.DECIMAL(20, 3))
  usedStock: number;

  // количество сломанных товаров
  @Column(DataType.DECIMAL(20, 3))
  brokenStock: number;

  @Column(DataType.DECIMAL(20, 3))
  totalStock: number;

  // количество потерянных товаров
  @Column(DataType.DECIMAL(20, 3))
  lostNewStock: number;

  // количество потерянных товаров
  @Column(DataType.DECIMAL(20, 3))
  lostUsedStock: number;

  // количество потерянных товаров
  @Column(DataType.DECIMAL(20, 3))
  lostBrokenStock: number;

  @Column(DataType.DECIMAL(20, 3))
  lostTotalStock: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  price: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  totalPrice: number;

  @Column(DataType.STRING)
  unit: string;

  @Column(DataType.TEXT)
  barnLocation: string;

  @Column(DataType.TEXT)
  clientLocation: string;

  @Column(DataType.TEXT)
  @IsString()
  driverName?: string;

  @Column(DataType.TEXT)
  @IsString()
  carNumber?: string;

  @Column(DataType.TEXT)
  info: string;

  @Column(DataType.INTEGER)
  productId: number;
}
