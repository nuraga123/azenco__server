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
  unit: string;

  @Column
  azenco__code: string;

  @Column
  images: string;
}
