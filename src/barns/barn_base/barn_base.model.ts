import { Table, Model, Column, DataType } from 'sequelize-typescript';

// Базовая модель
@Table
export class BarnBase extends Model {
  @Column(DataType.INTEGER)
  userId: number;

  @Column(DataType.INTEGER)
  productId: number;

  @Column(DataType.TEXT)
  username: string;

  @Column(DataType.TEXT)
  productName: string;

  @Column(DataType.TEXT)
  azencoCode: string;

  @Column(DataType.TEXT)
  type: string;

  @Column(DataType.TEXT)
  unit: string;

  @Column(DataType.DECIMAL(20, 2))
  price: number;

  @Column({
    type: DataType.TEXT,
    defaultValue:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm424ZDEAqyOEOLHRT1AEVPX2FclrAI6-DvreI90eahg&s',
  })
  img: string;

  @Column(DataType.TEXT)
  location: string;

  @Column(DataType.DECIMAL(20, 3))
  totalAllStock: number;

  @Column(DataType.DECIMAL(20, 2))
  totalAllPrice: number;
}

// Модель для существующих запасов, наследуется от базовой модели
@Table
export class Barn extends BarnBase {
  @Column(DataType.DECIMAL(20, 3))
  newStock: number;

  @Column(DataType.DECIMAL(20, 3))
  usedStock: number;

  @Column(DataType.DECIMAL(20, 3))
  brokenStock: number;

  @Column(DataType.DECIMAL(20, 3))
  newPrice: number;

  @Column(DataType.DECIMAL(20, 3))
  usedPrice: number;

  @Column(DataType.DECIMAL(20, 3))
  brokenPrice: number;
}

// Модель для потерянных запасов, также наследуется от базовой модели
@Table
export class LostBarn extends BarnBase {
  @Column(DataType.DECIMAL(20, 3))
  lostNewStock: number;

  @Column(DataType.DECIMAL(20, 3))
  lostUsedStock: number;

  @Column(DataType.DECIMAL(20, 3))
  lostBrokenStock: number;

  @Column(DataType.DECIMAL(20, 3))
  lostNewPrice: number;

  @Column(DataType.DECIMAL(20, 3))
  lostUsedPrice: number;

  @Column(DataType.DECIMAL(20, 3))
  lostBrokenPrice: number;
}
