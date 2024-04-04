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
  status: StatusOrderType; // Используем тип IStatusOrderTypes

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  azenco__code: string;

  @Column({ type: DataType.DECIMAL(20, 3) })
  quantity: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  price: number;

  @Column(DataType.DECIMAL)
  total_price: number;

  // заказчик
  @Column(DataType.NUMBER)
  clientId: number;
  // заказчик
  @Column(DataType.NUMBER)
  clientName: number;

  // отправитель
  @Column(DataType.NUMBER)
  anbarById: number;

  // отправитель
  @Column(DataType.STRING)
  anbarByName: string;

  @Column(DataType.STRING)
  unit: string;

  @Column(DataType.STRING)
  img: string;
}
