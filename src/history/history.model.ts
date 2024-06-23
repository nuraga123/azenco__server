import { IsString } from 'class-validator';
import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { IMovementType } from 'src/products/types';

@Table({ tableName: 'History' })
export class History extends Model<History> {
  @Column(DataType.INTEGER)
  barnId: number;

  // Идентификатор пользователя
  @Column(DataType.INTEGER)
  userId: number;

  // Имя пользователя
  @Column(DataType.TEXT)
  username: string;

  // Выбранная пользователем дата
  @Column(DataType.TEXT)
  userSelectedDate: string;

  // Типы движения
  @Column(
    DataType.ENUM(
      'приход__gələn',
      'расход__istehlak',
      'отправление__gediş',
      'списание__silinmə',
      'возврат__qayıdış',
      'изменения__dəyişikliklər',
    ),
  )
  movementType: IMovementType;

  // Источник (откуда перемещен товар)
  @Column(DataType.TEXT)
  fromLocation: string;

  // Назначение (куда перемещен товар)
  @Column(DataType.TEXT)
  toLocation: string;

  // Сообщение
  @Column(DataType.TEXT)
  message: string;

  // Название продукта
  @Column(DataType.TEXT)
  productName: string;

  // Код Azenco
  @Column(DataType.TEXT)
  azencoCode: string;

  // Единица измерения
  @Column(DataType.TEXT)
  @IsString()
  unit: string;

  // Цена за единицу
  @Column(DataType.DECIMAL(20, 2))
  price: number;

  /* сток */
  // Новый запас продукта
  @Column(DataType.DECIMAL(20, 3))
  newStock: number;

  // Использованный запас продукта
  @Column(DataType.DECIMAL(20, 3))
  usedStock: number;

  // Поломанный запас продукта
  @Column(DataType.DECIMAL(20, 3))
  brokenStock: number;

  // Общий запас продукта
  @Column(DataType.DECIMAL(20, 3))
  totalStock: number;

  /* Потерянный сток продуктов */
  // Потерянный новый продукт
  @Column(DataType.DECIMAL(20, 3))
  lostNewStock: number;

  // Потерянный использованный продукт
  @Column(DataType.DECIMAL(20, 3))
  lostUsedStock: number;

  // Потерянный поломанный продукт
  @Column(DataType.DECIMAL(20, 3))
  lostBrokenStock: number;

  // Общий потерянный продукт
  @Column(DataType.DECIMAL(20, 3))
  lostTotalStock: number;
}
