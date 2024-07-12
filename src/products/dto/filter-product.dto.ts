import { IsString } from 'class-validator';

export class FilterProductDto {
  type: 'name' | 'code';
  sortBy: 'asc' | 'desc';

  @IsString()
  searchValue: string;

  @IsString()
  priceFrom?: string;

  @IsString()
  priceTo?: string;
}
