import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'Ivan' })
  @IsNotEmpty()
  readonly secret: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  readonly newPassword: string;
}
