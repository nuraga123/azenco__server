import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CancelSendOrderDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  cancelOrderText: string;
}
