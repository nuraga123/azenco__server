import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class SendBarnUserDto {
  @IsOptional()
  @IsString()
  barnUserMessage?: string;

  @IsNotEmpty()
  @IsString()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  barnUsername: string;

  @IsNotEmpty()
  @IsString()
  barnLocationProduct: string;

  @IsNotEmpty()
  @IsNumber()
  barnUserId: number;

  @IsNotEmpty()
  @IsNumber()
  barnId: number;

  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsNotEmpty()
  @IsString()
  carNumber: string;

  @IsNotEmpty()
  @IsString()
  userSelectedDate: string;

  @IsNotEmpty()
  @IsNumber()
  newStockSend: number;

  @IsNotEmpty()
  @IsNumber()
  usedStockSend: number;

  @IsNotEmpty()
  @IsNumber()
  brokenStockSend: number;

  @IsNumber()
  updatePrice?: number;
}
