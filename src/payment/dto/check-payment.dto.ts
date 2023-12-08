import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CheckPaymentDto {
  @ApiProperty({ example: '2d03c171-000f-5000-8000-1c17cad8376a' })
  @IsNotEmpty()
  readonly paymentId: number;
}
