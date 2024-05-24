import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ tableName: 'History' })
export class History extends Model<History> {
  // Идентификатор пользователя
  @Column(DataType.INTEGER)
  userId: number;

  // Имя пользователя
  @Column(DataType.TEXT)
  username: string;

  // Выбранная пользователем дата
  @Column(DataType.TEXT)
  userSelectedDate: string;

  // Тип движения (приход, перемещение, расход и т.д.)
  @Column(DataType.TEXT)
  movementType: string;

  // Название продукта
  @Column(DataType.TEXT)
  productName: string;

  // Единица измерения
  @Column(DataType.TEXT)
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

  /* цены */
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

  /* Потерянный Цена продуктов */
  // Цена потерянного нового продукта
  @Column(DataType.DECIMAL(20, 2))
  lostNewTotalPrice: number;

  // Цена потерянного использованного продукта
  @Column(DataType.DECIMAL(20, 2))
  lostUsedTotalPrice: number;

  // Цена потерянного поломанного продукта
  @Column(DataType.DECIMAL(20, 2))
  lostBrokenTotalPrice: number;

  // Цена потерянного продукта
  @Column(DataType.DECIMAL(20, 2))
  lostTotalPrice: number;

  // Источник (откуда перемещен товар)
  @Column(DataType.TEXT)
  source: string;

  // Назначение (куда перемещен товар)
  @Column(DataType.TEXT)
  destination: string;

  // Сообщение
  @Column(DataType.TEXT)
  message: string;
}
