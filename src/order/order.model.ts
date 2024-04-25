import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { StatusOrderType } from './types';

@Table
export class Order extends Model<Order> {
  @Column({
    type: DataType.ENUM(
      'новый_заказ',
      'заказ_принял_складчик',
      'заказ_отменен_складчиком',
      'заказ_отправлен_клиенту',
      'заказ_успешно_доставлен',
      'заказ_доставлен_с_потерей_и_повреждениями',
      'заказ_доставлен_с_повреждениями',
      'заказ_доставлен_с_потерей',
      'заказ_недоставлен',
    ),
  })
  status: StatusOrderType;

  @Column(DataType.INTEGER)
  clientId: number;

  @Column(DataType.TEXT)
  clientUserName: string;

  @Column(DataType.INTEGER)
  anbarId: number;

  @Column(DataType.TEXT)
  anbarUsername: string;

  @Column(DataType.TEXT)
  name: string;

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

  // количество потерянных товаров
  @Column(DataType.DECIMAL(20, 3))
  lostStock: number;

  @Column(DataType.DECIMAL(20, 3))
  totalStock: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  price: number;

  @Column({ type: DataType.DECIMAL(20, 2) })
  totalPrice: number;

  @Column(DataType.STRING)
  unit: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  anbarLocation: string;

  @Column(DataType.TEXT)
  clientLocation: string;

  @Column({ defaultValue: '', type: DataType.TEXT })
  img: string;
}
