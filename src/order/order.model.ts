import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Order extends Model<Order> {
  @Column
  status: string;

  @Column
  name: string;

  @Column
  azenco__code: string;

  @Column
  quantity: number;

  @Column
  price: number;

  @Column
  totalPrice: number;

  @Column
  orderedBy: string;

  @Column
  orderedFrom: string;

  @Column
  unit: string;

  @Column
  img: string;
}
