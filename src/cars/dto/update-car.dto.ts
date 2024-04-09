import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCarDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  carNumber: string;
}
