import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class NewOrderDto {
  @IsNotEmpty()
  @IsNumber()
  barnId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  newStock: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  usedStock: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  brokenStock: number;

  @IsNotEmpty()
  @IsString()
  clientLocation: string;

  @IsNotEmpty()
  @IsString()
  clientMessage?: string;
}
