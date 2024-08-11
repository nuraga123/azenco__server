import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ConfirmBarnUserDto {
  barnUserMessage?: string;

  @IsNotEmpty()
  @IsString()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  barnUsername: string;

  @IsNotEmpty()
  @IsNumber()
  barnUserId: number;

  @IsNotEmpty()
  @IsNumber()
  barnId: number;

  @IsNotEmpty()
  @IsString()
  userSelectedDate: string;
}
