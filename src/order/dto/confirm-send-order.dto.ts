import { IsNumber, IsNotEmpty } from 'class-validator';

export class ConfirmOrderAnbarDto {
  @IsNotEmpty()
  @IsNumber()
  anbarIdOrder: number;

  @IsNotEmpty()
  @IsNumber()
  orderIdOrder: number;
}
