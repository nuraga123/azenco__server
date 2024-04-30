import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatedAnbarDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly productId: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  readonly newStock: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  readonly usedStock: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  readonly brokenStock: number;

  @ApiProperty({ example: 3 })
  @IsNotEmpty()
  readonly lostStock: number;

  @ApiProperty({ example: 'Москва' })
  @IsNotEmpty()
  readonly location: string;
}
