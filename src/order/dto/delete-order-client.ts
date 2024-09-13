import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class DeleteOrderFromClientDTO {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsString()
  azencoCode: string;

  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsString()
  clientUserName: string;
}
