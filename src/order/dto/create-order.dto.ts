import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarFromId: number;

  @IsNotEmpty()
  @IsNumber()
  userById: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
