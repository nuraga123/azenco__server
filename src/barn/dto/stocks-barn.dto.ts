import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

// DTO для обновления количества товаров в амбаре
export class StocksBarnDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({ example: 10 })
  readonly newStock?: number;

  @ApiProperty({ example: 5 })
  readonly usedStock?: number;

  @ApiProperty({ example: 2 })
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
