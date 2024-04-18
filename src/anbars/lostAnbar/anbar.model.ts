import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table
export class Anbar extends Model {
  @Column(DataType.INTEGER)
  userId: number;

  @Column(DataType.TEXT)
  username: string;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  azencoCode: string;

  @Column(DataType.TEXT)
  type: string;

  @Column(DataType.TEXT)
  unit: string;

  @Column(DataType.INTEGER)
  productId: number;

  @Column(DataType.DECIMAL(20, 3))
  price: number;

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

  // общая стоимость всех товаров
  @Column(DataType.DECIMAL(20, 2))
  totalPrice: number;

  // до заказа общая цена продукта
  @Column(DataType.DECIMAL(20, 2))
  previousTotalPrice: number;

  // до заказа количество продуктов
  @Column(DataType.DECIMAL(20, 3))
  previousStock: number;

  @Column(DataType.BOOLEAN)
  ordered: boolean;

  @Column({
    type: DataType.TEXT,
    defaultValue:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm424ZDEAqyOEOLHRT1AEVPX2FclrAI6-DvreI90eahg&s',
  })
  img: string;

  @Column(DataType.TEXT)
  location: string;
}
