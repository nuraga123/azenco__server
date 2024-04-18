import { IsInt, IsNotEmpty } from 'class-validator';

export class TransferStockDto {
  @IsInt()
  @IsNotEmpty()
  readonly fromUserId: number;

  @IsNotEmpty()
  readonly fromUsername: string;

  @IsInt()
  @IsNotEmpty()
  readonly toUserId: number;

  @IsNotEmpty()
  readonly toUsername: string;

  @IsInt()
  @IsNotEmpty()
  readonly productId: number;

  @IsInt()
  @IsNotEmpty()
  readonly quantity: number;
}
