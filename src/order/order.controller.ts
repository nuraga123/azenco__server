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

  @Get()
  @HttpCode(HttpStatus.OK)
  getCountAndRowsOrders(
    @Query() query: IOrderQuery,
  ): Promise<ICountAndRowsOrdersResponse> {
    return this.orderService.findAndCountAllOrders(query);
  }

  // Обработчик POST запроса для создания нового заказа
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async addNewOrder(@Body() newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    return await this.orderService.create(newOrderDto);
  }

  // Обработчик POST запроса для создания нового заказа
  @Delete('remove')
  @HttpCode(HttpStatus.CREATED)
  async removeOrderById(@Body('id') id: number): Promise<IOrderResponse> {
    return await this.orderService.remove(+id);
  }
}
