import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class History extends Model {
  @Column
  message: string;

  @Column
  username: string;

  @Column
  userId: number;
}
