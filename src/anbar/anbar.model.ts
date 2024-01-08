import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class Anbar extends Model {
  @Column
  userId: number;

  @Column({ defaultValue: 0 })
  productId: number;

  @Column
  name: string;

  @Column({ defaultValue: 0 })
  stock: number;

  @Column({ defaultValue: 0 })
  price: number;

  @Column({ defaultValue: 0 })
  total_price: number;

  @Column
  type: string;

  @Column
  img: string;
}
