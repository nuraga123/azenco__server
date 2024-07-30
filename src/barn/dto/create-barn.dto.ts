import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatedBarnDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  readonly productId: number;

  @ApiProperty({ example: 'Москва' })
  @IsNotEmpty()
  @IsString()
  readonly location: string;

  @ApiProperty({ example: 10.777 })
  @IsNotEmpty()
  @IsNumber()
  readonly newStock: number;

  @ApiProperty({ example: 5.555 })
  @IsNotEmpty()
  @IsNumber()
  readonly usedStock: number;

  @ApiProperty({ example: 2.777 })
  @IsNotEmpty()
  @IsNumber()
  readonly brokenStock: number;

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

  @IsString()
  userSelectedDate?: string;

  @IsString()
  fromLocation?: string;
}
