import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

// DTO для обновления количества товаров в амбаре
export class UpdatedAnbarDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({ example: 10 })
  readonly newStock?: number;

  @ApiProperty({ example: 5 })
  readonly usedStock?: number;

  @ApiProperty({ example: 2 })
  readonly brokenStock?: number;

  @ApiProperty({ example: 3 })
  readonly lostStock?: number;

  @ApiProperty({ example: 'Москва' })
  @IsNotEmpty()
  readonly location: string;
}
