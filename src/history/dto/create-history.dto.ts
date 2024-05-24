import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { IUnit } from 'src/products/types';

export class CreateHistoryDto {
  // Идентификатор пользователя
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  // Имя пользователя
  @IsNotEmpty()
  @IsString()
  username: string;

  // Выбранная пользователем дата
  @IsNotEmpty()
  @IsString()
  userSelectedDate: string;

  // Тип движения (приход, перемещение, расход и т.д.)
  @IsNotEmpty()
  @IsString()
  movementType: string;

  // Название продукта
  @IsNotEmpty()
  @IsString()
  productName: string;

  // Единица измерения
  @IsNotEmpty()
  @IsString()
  unit: IUnit;

  // Цена за единицу
  @IsNotEmpty()
  @IsNumber()
  price: number;

  /* сток */
  // Новый запас продукта
  @IsNumber()
  newStock?: number;

  // Использованный запас продукта
  @IsNumber()
  usedStock?: number;

  // Поломанный запас продукта
  @IsNumber()
  brokenStock?: number;

  // Общий запас продукта
  @IsNumber()
  totalStock?: number;

  /* цены */
  // Новая цена продукта
  @IsNumber()
  newTotalPrice?: number;

  // Цена продукта после использования
  @IsNumber()
  usedTotalPrice?: number;

  // Цена продукта после поломки
  @IsNumber()
  brokenTotalPrice?: number;

  // Общая цена всех продуктов
  @IsNumber()
  totalPrice?: number;

  /* Потерянный сток продуктов */
  // Потерянный новый продукт
  @IsNumber()
  lostNewStock?: number;

  // Потерянный использованный продукт
  @IsNumber()
  lostUsedStock?: number;

  // Потерянный поломанный продукт
  @IsNumber()
  lostBrokenStock?: number;

  // Общий потерянный продукт
  @IsNumber()
  lostTotalStock?: number;

  /* Потерянные цены продуктов */
  // Цена потерянного нового продукта
  @IsNumber()
  lostNewTotalPrice?: number;

  // Цена потерянного использованного продукта
  @IsNumber()
  lostUsedTotalPrice?: number;

  // Цена потерянного поломанного продукта
  @IsNumber()
  lostBrokenTotalPrice?: number;

  // Цена потерянного продукта
  @IsNumber()
  lostTotalPrice?: number;

  // Источник (откуда перемещен товар)
  @IsString()
  source: string;

  // Назначение (куда перемещен товар)
  @IsString()
  destination: string;

  // Сообщение
  @IsString()
  message: string;
}
