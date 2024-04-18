import { Table, Column, DataType } from 'sequelize-typescript';
import { Anbar } from '../anbar/anbar.service';

// свойства для сломанных товаров
@Table
export class BrokenAnbar extends Anbar {
  @Column(DataType.DECIMAL(20, 3))
  brokenStock: number;

  @Column(DataType.DECIMAL(20, 2))
  brokenTotalPrice: number;

  @Column(DataType.DECIMAL(20, 3))
  previousBrokenStock: number;

  @Column(DataType.DECIMAL(20, 2))
  brokenPreviousTotalPrice: number;

  @Column(DataType.TEXT)
  location: string;
}
