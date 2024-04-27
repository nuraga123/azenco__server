import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { NewOrderDto } from './dto/new-order.dto';
import {
  ICountAndRowsOrdersResponse,
  IOrderQuery,
  IOrderResponse,
  IOrdersResponse,
} from './types';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {
    /**/
  }

  //получения всех заказов
  @Get('all')
  @HttpCode(HttpStatus.OK)
  getOrders(): Promise<IOrdersResponse> {
    return this.orderService.findAllOrders();
  }

  // запроса для получения заказов с параметрами
  // пример: orders?limit=20&offset=0
  @Get()
  @HttpCode(HttpStatus.OK)
  getCountAndRowsOrders(
    @Query() query: IOrderQuery,
  ): Promise<ICountAndRowsOrdersResponse> {
    return this.orderService.findAndCountAllOrders(query);
  }

  // запрос для создания нового заказа
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  addNewOrder(@Body() newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    return this.orderService.createOrder(newOrderDto);
  }

  @Post('confirm-anbar-user')
  @HttpCode(HttpStatus.OK)
  confirmAnbarUser(@Body('id') id: number): Promise<IOrderResponse> {
    return this.orderService.confirmAnbarUserOrder(id);
  }

  @Post('send-anbar-user')
  @HttpCode(HttpStatus.OK)
  sendAnbarUser(@Body('id') id: number): Promise<IOrderResponse> {
    return this.orderService.sendAnbarUserOrder(id);
  }

  // запрос для удаления заказа клиентом
  @Delete('remove-client')
  @HttpCode(HttpStatus.OK)
  removeOrderToClient(@Body('id') id: number): Promise<IOrderResponse> {
    return this.orderService.cancelOrderClient(+id);
  }

  @Post('success-deliver-client')
  successDeliverToClient(
    @Body('id') id: number,
    @Body('clientAnbarId') clientAnbarId: number,
  ): Promise<IOrderResponse> {
    return this.orderService.successDeliver({
      id,
      clientAnbarId,
    });
  }
}
