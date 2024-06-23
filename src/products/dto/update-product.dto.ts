import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  azencoCode?: string;

  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  type?: string;

  @IsNotEmpty()
  @IsString()
  unit?: string;

  @IsNotEmpty()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  img?: string;
}
