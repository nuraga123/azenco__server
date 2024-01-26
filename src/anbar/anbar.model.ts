import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class Anbar extends Model {
  @Column
  userId: number;

  @Column({ defaultValue: 0 })
  productId: number;

  @Column
  username: string;

  @Column
  name: string;

  @Column
  type: string;

  @Column({ defaultValue: 0 })
  price: number;

  @Column({ defaultValue: 0 })
  stock: number;

  @Column({ defaultValue: 0 })
  total_price: number;

  @Column
  img: string;

  @Column({ defaultValue: false })
  ordered: boolean;

  @Column
  unit: string;

  @Column({ defaultValue: 0 })
  previous_total_price: number;

  @Column({ defaultValue: 0 })
  previous_stock: number;
}
