import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { IMovementType } from 'src/products/types';

export class CreateArchiveDto {
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

  @IsNotEmpty()
  @IsString()
  productId?: number;

  @IsNotEmpty()
  @IsString()
  fromUsername?: string;

  @IsNotEmpty()
  @IsString()
  toUsername?: string;

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

  // получатель - alıcı
  @IsString()
  recipientName?: string;

  // поставщик - göndərən
  @IsString()
  senderName?: string;

  @IsString()
  driverName?: string;

  @IsString()
  carNumber?: string;

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

  /*  типизированные сумма колличество на цену товара в складе  */

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

  /* Потерянные --- Lost */

  /* типизированные имена "Потерянных" количеств товара в складе */

  /*  типизированные "Потерянных" сумма = колличество * цену товара в складе  */
  // Новая цена продукта
  @IsNumber()
  lostNewTotalPrice?: number;

  // Цена продукта после использования
  @IsNumber()
  lostUsedTotalPrice?: number;

  // Цена продукта после поломки
  @IsNumber()
  lostBrokenTotalPrice?: number;

  // Цена потерянного продукта
  @IsNumber()
  lostTotalPrice?: number;
}
