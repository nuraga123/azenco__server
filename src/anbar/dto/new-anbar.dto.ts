import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class NewAnbarDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  readonly userId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly productId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly stock: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly location: string;
}
