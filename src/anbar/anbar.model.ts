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

  @Column
  stock: number;

  @Column
  total_price: number;

  @Column({ defaultValue: 0 })
  previous_stock: number;

  @Column({ defaultValue: 0 })
  previous_total_price: number;

  @Column({ defaultValue: false })
  ordered: boolean;

  @Column({ defaultValue: '' })
  images: string;
}
