import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class NewOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  readonly newStock: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  readonly usedStock: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  readonly brokenStock: number;

  @IsNotEmpty()
  @IsString()
  clientLocation: string;
}
