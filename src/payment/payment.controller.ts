import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MakePaymentDto } from './dto/make-payment.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { MakePaymentResponse } from './types';
import { CheckPaymentDto } from './dto/check-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @ApiOkResponse({ type: MakePaymentResponse })
  @Post()
  makePayment(@Body() makePayment: MakePaymentDto) {
    return this.paymentService.makePayment(makePayment);
  }

  @Post('/info')
  checkPayment(@Body() checkPaymentDto: CheckPaymentDto) {
    return this.paymentService.checkPayment(checkPaymentDto);
  }
}
