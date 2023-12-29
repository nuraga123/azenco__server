import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class Product extends Model {
  @Column
  name: string;

  @Column
  type: string;

  @Column
  price: number;

  @Column
  vendor_code: string;

  @Column
  unit: string;

  @Column
  quantity: number;

  @Column
  images: string[];
}
