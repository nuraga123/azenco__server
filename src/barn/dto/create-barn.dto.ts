import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatedBarnDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  readonly newStock: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  readonly usedStock: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  readonly brokenStock: number;

  @ApiProperty({ example: 'Москва' })
  @IsNotEmpty()
  @IsString()
  readonly location: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  readonly lostNewStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly lostUsedStock?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  readonly lostBrokenStock?: number;
}
