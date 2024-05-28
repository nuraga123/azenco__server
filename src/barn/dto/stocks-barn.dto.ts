import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// DTO для обновления количества товаров в амбаре
export class StocksBarnDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly barnId: number;

  // Тип движения (приход, перемещение, расход)
  @IsString()
  readonly movementType: string;

  // Выбранная пользователем дата
  @IsString()
  readonly userSelectedDate: string;

  // Источник (откуда перемещен товар)
  @IsString()
  readonly fromLocation: string;

  // Назначение (куда перемещен товар)
  @IsString()
  readonly toLocation: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  readonly newStock?: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  readonly usedStock?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  readonly brokenStock?: number;

  // lost
  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly lostNewStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly lostUsedStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly lostBrokenStock?: number;
}
