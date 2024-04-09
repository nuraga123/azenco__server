import { IsNotEmpty, IsString } from 'class-validator';

export class NewCarDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  carNumber: string;
}
