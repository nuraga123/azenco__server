import { IsString } from 'class-validator';
import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ tableName: 'Barn' })
export class Barn extends Model {
  // Идентификатор пользователя
  @Column(DataType.INTEGER)
  userId: number;

  // Имя пользователя
  @Column(DataType.TEXT)
  username: string;

  // Идентификатор продукта
  @Column(DataType.INTEGER)
  productId: number;

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
  @IsString()
  unit: string;

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

  // цена
  @Column(DataType.DECIMAL(20, 2))
  price: number;

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

  // Общая цена всех продуктов
  @Column(DataType.DECIMAL(20, 3))
  totalStock: number;

  /*  типизированные сумма колличество на цену товара в складе  */

  // Новая цена продукта
  @Column(DataType.DECIMAL(20, 2))
  newTotalPrice: number;

  // Цена продукта после использования
  @Column(DataType.DECIMAL(20, 2))
  usedTotalPrice: number;

  // Цена продукта после поломки
  @Column(DataType.DECIMAL(20, 2))
  brokenTotalPrice: number;

  // Общая цена всех продуктов
  @Column(DataType.DECIMAL(20, 2))
  totalPrice: number;

  /* Потерянные --- Lost */

  /* типизированные имена "Потерянных" количеств товара в складе */

  // Потерянный новый продукт
  @Column(DataType.DECIMAL(20, 3))
  lostNewStock: number;

  // Потерянный использованный продукт
  @Column(DataType.DECIMAL(20, 3))
  lostUsedStock: number;

  // Потерянный использованный продукт
  @Column(DataType.DECIMAL(20, 3))
  lostBrokenStock: number;

  // Цена продукта после поломки
  @Column(DataType.DECIMAL(20, 3))
  lostTotalStock: number;

  /*  типизированные "Потерянных" сумма = колличество * цену товара в складе  */
  // Новая цена продукта
  @Column(DataType.DECIMAL(20, 2))
  lostNewTotalPrice: number;

  // Цена продукта после использования
  @Column(DataType.DECIMAL(20, 2))
  lostUsedTotalPrice: number;

  // Цена продукта после поломки
  @Column(DataType.DECIMAL(20, 2))
  lostBrokenTotalPrice: number;

  // Цена потерянного продукта
  @Column(DataType.DECIMAL(20, 2))
  lostTotalPrice: number;

  // Цена потерянного продукта
  @Column(DataType.BOOLEAN)
  orderStatus: boolean;
  name: any;
  lostStock: number;
}
