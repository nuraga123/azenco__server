import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// DTO для обновления количества товаров в амбаре
export class StocksBarnDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  barnId: number;

  // Выбранная пользователем дата
  @IsString()
  userSelectedDate: string;

  // Источник (откуда перемещен товар)
  @IsString()
  fromLocation: string;

  // Назначение (куда перемещен товар)
  @IsString()
  toLocation: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  newStock?: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  usedStock?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  brokenStock?: number;

  // lost
  @ApiProperty({ example: 0 })
  @IsNumber()
  lostNewStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  lostUsedStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  lostBrokenStock?: number;

  @IsString()
  driverName: string;

  @IsString()
  carNumber: string;

  // получатель - alıcı
  @IsString()
  recipientName?: string;

  // поставщик - göndərən
  @IsString()
  senderName?: string;
}
