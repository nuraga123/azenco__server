import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table
export class Barn extends Model {
  // Идентификатор пользователя
  @Column(DataType.INTEGER)
  userId: number;

  // Идентификатор продукта
  @Column(DataType.INTEGER)
  productId: number;

  // Имя пользователя
  @Column(DataType.TEXT)
  username: string;

  // Название продукта
  @Column(DataType.TEXT)
  productName: string;

  // Код Azenco
  @Column(DataType.TEXT)
  azencoCode: string;

  // Тип продукта
  @Column(DataType.TEXT)
  type: string;

  // Единица измерения
  @Column(DataType.TEXT)
  unit: string;

  // Цена продукта
  @Column(DataType.DECIMAL(20, 2))
  price: number;

  // Изображение продукта
  @Column({
    type: DataType.TEXT,
    defaultValue:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm424ZDEAqyOEOLHRT1AEVPX2FclrAI6-DvreI90eahg&s',
  })
  img: string;

  // Местоположение продукта
  @Column(DataType.TEXT)
  location: string;

  /*  типизированные имена количества товара в складе  */

  // Новый запас продукта
  @Column(DataType.DECIMAL(20, 3))
  newStock: number;

  // Использованный запас продукта
  @Column(DataType.DECIMAL(20, 3))
  usedStock: number;

  // Поломанный запас продукта
  @Column(DataType.DECIMAL(20, 3))
  brokenStock: number;

  // Новая цена продукта
  @Column(DataType.DECIMAL(20, 3))
  newPrice: number;

  // Цена продукта после использования
  @Column(DataType.DECIMAL(20, 3))
  usedPrice: number;

  // Цена продукта после поломки
  @Column(DataType.DECIMAL(20, 3))
  brokenPrice: number;

  // Потерянный запас продукта
  @Column(DataType.DECIMAL(20, 3))
  lostStock: number;

  // Цена потерянного продукта
  @Column(DataType.DECIMAL(20, 2))
  lostPrice: number;

  // Общий запас всех продуктов
  @Column(DataType.DECIMAL(20, 3))
  totalStock: number;

  // Общая цена всех продуктов
  @Column(DataType.DECIMAL(20, 2))
  totalPrice: number;
}
