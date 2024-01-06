import { Table, Model, Column, DataType } from 'sequelize-typescript';

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

  @Column(DataType.ARRAY(DataType.STRING))
  images: string[];
}
