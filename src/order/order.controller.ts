import { Body, Controller, Get, Post } from '@nestjs/common';
import { Order } from './order.model';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderAnbarDto } from './dto/confirm-send-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Обработчик POST запроса для создания нового заказа
  @Post('new-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<{
    order?: Order;
    message?: string;
    error?: string;
  }> {
    return await this.orderService.createOrderAnbar(createOrderDto);
  }

  @Post('confirm-send-customer')
  async confirmOrderAnbar(
    @Body() confirmOrderAnbarDto: ConfirmOrderAnbarDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      return await this.orderService.confirmOrderAnbar(confirmOrderAnbarDto);
    } catch (error) {
      return { error: `Ошибка при выполнении операции: ${error.message}` };
    }
  }

  // Обработчик GET запроса для получения всех заказов
  @Get('all')
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }
}
