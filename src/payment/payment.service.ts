import { Injectable, ForbiddenException } from '@nestjs/common';
import { MakePaymentDto } from './dto/make-payment.dto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  async makePayment(makePaymentDto: MakePaymentDto) {
    try {
      const { data } = await axios({
        method: 'POST',

        url: 'https://api.yookassa.ru/v3/payments',

        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': Date.now(),
        },

        auth: {
          username: '259116',
          password: 'test_NJySs44aNa1Ro6HJlMY2PQwbaWwBDQ4trAUMj_2vIpc',
        },

        data: {
          amount: {
            value: makePaymentDto.amount,
            currency: 'RUB',
          },
          confirmation: {
            type: 'redirect',
            return_url: 'http://localhost:3001/order',
          },
          description: 'Заказ №1',
        },
      });

      return data;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
}
