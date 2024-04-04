import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  anbarFromId: number;

  @IsNotEmpty()
  @IsNumber()
  userById: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
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
