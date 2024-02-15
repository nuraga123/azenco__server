import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto implements IOrderProps {
  @IsNotEmpty()
  @IsNumber()
  anbarId: number;

  @IsNotEmpty()
  @IsString()
  orderedBy: string;

  @IsNotEmpty()
  @IsString()
  orderedFrom: string;
}
