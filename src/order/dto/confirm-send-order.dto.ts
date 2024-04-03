import { IsNumber, IsNotEmpty } from 'class-validator';

export class ConfirmSendOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarIdOrder: number;

  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}
