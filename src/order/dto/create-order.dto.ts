import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarIdOrder: number;

  @IsNotEmpty()
  @IsNumber()
  userIdOrder: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
