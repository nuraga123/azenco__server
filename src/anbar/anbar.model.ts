import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class Anbar extends Model {
  @Column
  userId: number;

  @Column
  username: string;

  @Column
  name: string;

  @Column
  azenco__code: string;

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
  total_price: number;

  @Column({ defaultValue: 0 })
  previous_total_price: number;

  @Column({ defaultValue: 0 })
  previous_stock: number;

  @Column({ defaultValue: false })
  ordered: boolean;

  @Column({ defaultValue: '' })
  img: string;
}
