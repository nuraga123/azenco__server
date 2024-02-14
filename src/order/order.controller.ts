import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.model';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Обработчик POST запроса для создания нового заказа
  @Post('new-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  // Обработчик GET запроса для получения всех заказов
  @Get('all')
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  // Обработчик PUT запроса для обновления состояния заказа
  @Put(':id')
  async updateOrderStatus(
    @Param('id') orderId: number,
    @Body('status') newStatus: string,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(orderId, newStatus);
  }
}
