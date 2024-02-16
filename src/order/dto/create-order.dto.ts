import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarId: number;

  @IsNotEmpty()
  @IsString()
  orderedBy: string;

  @IsNotEmpty()
  @IsString()
  orderedFrom: string;

  @IsNotEmpty()
  @IsNumber()
  stock: number;
}
