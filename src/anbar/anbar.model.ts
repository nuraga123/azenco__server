import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table
export class Anbar extends Model {
  @Column
  userId: number;

  @Column
  username: string;

  @Column
  name: string;

  @Column
  azencoCode: string;

  @Column
  type: string;

  @Column
  unit: string;

  @Column
  productId: number;

  @Column
  price: number;

  // количество пригодных товаров
  @Column
  stock: number;

  // количество непригодных товаров
  @Column({ defaultValue: 0 })
  nonUsableStock: number;

  // количество потерянных товаров
  @Column({ defaultValue: 0 })
  lostStock: number;

  @Column
  totalPrice: number;

  // до заказа общая цена продукта
  @Column({ defaultValue: 0 })
  previousTotalPrice: number;

  // до заказа количество продуктов
  @Column({ defaultValue: 0 })
  previousStock: number;

  @Column({ defaultValue: false })
  ordered: boolean;

  @Column({ defaultValue: '' })
  img: string;

  @Column(DataType.TEXT)
  location: string;  
}
