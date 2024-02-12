import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class AnbarShoppingCart extends Model {
  @Column
  userId: number;

  @Column
  toUserAnbarId: number;

  @Column({ defaultValue: 0 })
  productId: number;

  @Column({ defaultValue: 0 })
  price: number;

  @Column
  name: string;

  @Column
  image: string;

  @Column({ defaultValue: 0 })
  in_stock: number;

  @Column({ defaultValue: 1 })
  count: number;

  @Column({ defaultValue: 50 })
  total_price: number;
}
