import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { Order } from './order.model';
import { OrderService } from './order.service';
import { NewOrderDto } from './dto/new-order.dto';
import { ConfirmSendOrderDto } from './dto/confirm-send-order.dto';
import { CancelSendOrderDto } from './dto/cancel-send-order.dto';
import { IOrderQuery, IOrderResponse, IOrdersResponse } from './types';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //получения всех заказов
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllOrders(@Query() query: IOrderQuery): Promise<IOrdersResponse> {
    return this.orderService.getCountAndRowsOrders(query);
  }

  // Обработчик POST запроса для создания нового заказа
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async addNewOrder(@Body() newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    return await this.orderService.create(newOrderDto);
  }

  @Post('confirm-anbar-order')
  async confirmOrderAnbar(
    @Body() confirmSendOrderDto: ConfirmSendOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      return await this.orderService.confirmOrderAnbar(confirmSendOrderDto);
    } catch (error) {
      return { error: `Ошибка при выполнении операции: ${error.message}` };
    }
  }

  // problem
  @Post('cancel-send-customer')
  async cancelOrder(@Body() cancelOrderDto: CancelSendOrderDto) {
    return this.orderService.cancelOrderAnbarUser(cancelOrderDto);
  }
}
