import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Car extends Model<Car> {
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  carNumber: string;

  @Column(DataType.BOOLEAN)
  isOccupied: boolean;
}
