import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { IMovementType } from 'src/products/types';

export class CreateHistoryDto {
  @IsNumber()
  barnId: number;

  // Сообщение
  @IsString()
  message: string;

  @IsNumber()
  userId: number;

  @IsString()
  username: string;

  // Тип движения (приход, перемещение, расход)
  @IsNotEmpty()
  @IsString()
  movementType?: IMovementType;

  // Выбранная пользователем дата
  @IsNotEmpty()
  @IsString()
  userSelectedDate?: string;

  // Источник (откуда перемещен товар)
  @IsString()
  fromLocation?: string;

  // Назначение (куда перемещен товар)
  @IsString()
  toLocation?: string;

  /* передача данных материала */
  @IsString()
  azencoCode?: string;

  // Название продукта
  @IsNotEmpty()
  @IsString()
  productName?: string;

  // Единица измерения
  @IsNotEmpty()
  @IsString()
  unit?: string;

  @IsNumber()
  price?: number;

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

  @IsString()
  driverName?: string;

  @IsString()
  carNumber?: string;
}
