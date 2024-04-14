import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class NewOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  clientLocation: string;
}

export const order = {
  client: {
    name: 'nuraga',
    id: 1,
  },

  anbar_men: {
    id: 2,
    name: 'ferid',
  },

  order_anbar_products: [
    {
      id: 1,
      name: 'холодильник',
      price: 10,
      quatity: 4,
      unit: 'штук',
      total_price: 40,
    },
    {
      id: 2,
      name: 'печка',
      price: 1.5,
      quatity: 2,
      unit: 'штук',
      total_price: 3,
    },
  ],

  order_total_price: 43,
  message:
    'client - nuraga хочет у anbar_men: ferid Заказ: "4 - штук холодильник" и "2 - штук печька" Общая цена: 43 манат',
};
