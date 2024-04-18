import { IsInt, IsNotEmpty } from 'class-validator';

export class ConfirmReceivedDto {
  @IsInt()
  @IsNotEmpty()
  readonly userId: number | string;

  @IsInt()
  @IsNotEmpty()
  readonly anbarId: number | string;
}
