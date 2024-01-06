import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly azenco__code: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @IsNotEmpty()
  @IsString()
  readonly unit: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsString()
  readonly images?: string;
}
