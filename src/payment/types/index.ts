import { ApiProperty } from '@nestjs/swagger';

export class MakePaymentResponse {
  @ApiProperty({ example: '18a3287bbd8f' })
  id: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({
    example: {
      value: '50.00',
      currency: 'RUB',
    },
  })
  amount: {
    value: string;
    currency: string;
  };

  @ApiProperty({ example: 'Заказ №1' })
  description: string;

  @ApiProperty({
    example: {
      account_id: '259116',
      gateway_id: '2130611',
    },
  })
  recipient: {
    account_id: string;
    gateway_id: string;
  };

  @ApiProperty({ example: '2023-09-25T06:16:50.151Z' })
  created_at: string;

  @ApiProperty({
    example: {
      type: 'redirect',
      confirmation_url:
        'https://yoomoney.ru/checkout/payments/v2/contract?orderId=2ca33992-000f-5000-a000-18a3287bbd8f',
    },
  })
  confirmation: {
    type: string;
    confirmation_url: string;
  };

  @ApiProperty({ example: true })
  test: boolean;

  @ApiProperty({ example: false })
  paid: boolean;

  @ApiProperty({ example: false })
  refundable: boolean;

  @ApiProperty({ example: {} })
  metadata: object;
}
