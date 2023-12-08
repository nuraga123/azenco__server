import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MakePaymentDto } from './dto/make-payment.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { ApiOkResponse } from '@nestjs/swagger';
import { MakePaymentResponse } from './types';
import { CheckPaymentDto } from './dto/check-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @ApiOkResponse({ type: MakePaymentResponse })
  @UseGuards(AuthenticatedGuard)
  @Post()
  makePayment(@Body() makePayment: MakePaymentDto) {
    return this.paymentService.makePayment(makePayment);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/info')
  checkPayment(@Body() checkPaymentDto: CheckPaymentDto) {
    return this.paymentService.checkPayment(checkPaymentDto);
  }
}
