import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  azencoCode?: string;

  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  unit?: string;

  @IsNotEmpty()
  @IsNumber()
  price?: number;
}
