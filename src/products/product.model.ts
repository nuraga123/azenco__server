import { Table, Model, Column, Unique } from 'sequelize-typescript';

@Table
export class Product extends Model {
  @Unique
  @Column
  name: string;

  @Unique
  @Column
  azencoCode: string;

  @Column
  price: number;

  @Column
  type: string;

  @Column
  unit: string;

  @Column
  img: string;
}
