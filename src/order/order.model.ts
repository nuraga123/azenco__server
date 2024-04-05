import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { StatusOrderType } from './types';

@Table
export class Order extends Model<Order> {
  @Column({
    type: DataType.ENUM(
      'created',
      'sent_to_customer',
      'cancelled_by_customer',
      'cancelled_by_anbar',
      'received_by_customer',
      'refunded',
    ),
  })
  status: StatusOrderType;

  @Column(DataType.INTEGER)
  clientId: number;

  @Column(DataType.TEXT)
  clientName: string;

  @Column(DataType.INTEGER)
  anbarId: number;

  @Column(DataType.TEXT)
  anbarUsername: string;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.STRING)
  azencoCode: string;

  @Column({ type: DataType.DECIMAL(20, 3) })
  quantity: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  price: number;

  @Column(DataType.DECIMAL(20, 2))
  totalPrice: number;

  @Column(DataType.STRING)
  unit: string;

  @Column(DataType.STRING)
  img: string;

  @Column(DataType.TEXT)
  description: string;
}
